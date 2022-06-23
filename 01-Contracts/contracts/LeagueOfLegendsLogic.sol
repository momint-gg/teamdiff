// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Athletes.sol";
import "./Whitelist.sol";
import "./LeagueMaker.sol";
import "./MOBALogicLibrary.sol";
import "./GameItems.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TestUSDC.sol";

// TODO: Change all TestUSDC to maticUSDC when deploying to mainnet
contract LeagueOfLegendsLogic is Initializable, ReentrancyGuard {
    using SafeMath for uint256;

    string public leagueName;
    uint256 public numWeeks; // Current week of the split
    uint256 public stakeAmount;
    uint256 public currentWeekNum;
    address public admin;
    address public teamDiffAddress;
    bool public leagueEntryIsClosed;
    bool public lineupIsLocked;
    bool public isPublic;

    mapping(address => uint256[8]) public userToRecord; // User to their record
    mapping(address => uint256[5]) public userToLineup; // User to their lineup
    mapping(address => uint256[8]) public userToWeekScore; // User to their team's score each week
    mapping(address => uint256) public userToPoints; // User to their total points (win = 2 pts, tie = 1 pt)
    mapping(address => bool) public inLeague; // Checking if a user is in the league
    address[] public leagueMembers; // Contains league members (don't check this in requires though, very slow/gas intensive)
    address[] private leagueWinners;

    // League schedule
    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]

    /**********************/
    /* IMMUTABLE STORAGE  */
    /**********************/
    struct Stats {
        uint256 kills;
        uint256 deaths;
        uint256 assists;
        uint256 minionScore;
    }

    Athletes athletesContract;
    Whitelist public whitelistContract;
    LeagueMaker leagueMakerContract;
    IERC20 public erc20;
    GameItems gameItemsContract;

    //**************/
    //*** Events ***/
    /***************/
    event Staked(address sender, uint256 amount, address leagueAddress);
    event testUSDCDeployed(address sender, address contractAddress);
    event leagueEnded(address[] winner, uint256 prizePotPerWinner);

    //*****************/
    //*** Modifiers ***/
    /******************/
    // Only the admin (whoever created the league) can call
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    // Only our wallet can call, need this because the "owner" of the proxy contract isn't us
    modifier onlyTeamDiff() {
        require(msg.sender == teamDiffAddress, "Caller is not TeamDiff");
        _;
    }

    //Initialize all parameters of proxy
    function initialize(
        string calldata _name,
        uint256 _stakeAmount,
        bool _isPublic,
        address athletesDataStorageAddress,
        address _admin,
        address _ierc20Address,
        address _gameItemsContractAddress,
        address _teamDiffAddress,
        address _leagueMakerContractAddress
    ) public initializer {
        leagueName = _name;
        numWeeks = 8;
        admin = _admin;
        stakeAmount = _stakeAmount;
        isPublic = _isPublic;
        leagueEntryIsClosed = false;
        lineupIsLocked = false;
        athletesContract = Athletes(athletesDataStorageAddress);
        leagueMakerContract = LeagueMaker(_leagueMakerContractAddress);
        whitelistContract = new Whitelist(_isPublic); // Initializing our whitelist
        erc20 = IERC20(_ierc20Address);
        teamDiffAddress = _teamDiffAddress;
        gameItemsContract = GameItems(_gameItemsContractAddress);
        // adminStake(_admin); // Moving admin stake to leaguemaker bc admin will be sender
        console.log("Proxy initialized!");
    }

    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ***********/
    /*************************************************/
    // Instead of onlyOwner, only LeagueMakerLibrary should be able to call these functions
    function setLeagueSchedule() external onlyTeamDiff {
        MOBALogicLibrary.setLeagueSchedule(
            schedule,
            leagueMembers,
            numWeeks,
            leagueName
        );
    }

    function setLeagueEntryIsClosed() external onlyTeamDiff {
        leagueEntryIsClosed = true;
    }

    function lockLineup() external onlyTeamDiff {
        lineupIsLocked = true;
    }

    function unlockLineup() external onlyTeamDiff {
        lineupIsLocked = false;
    }

    // Evaluating all of the matches for a given week
    // On the last week, delegate the prize pot to the winner
    function evaluateMatches() external onlyTeamDiff {
        MOBALogicLibrary.evaluateMatches(
            currentWeekNum,
            athletesContract,
            userToRecord,
            userToLineup,
            userToPoints,
            userToWeekScore,
            schedule
        );

        // League is over
        if (currentWeekNum == numWeeks - 1) {
            onLeagueEnd();
            return;
        }
        currentWeekNum++;
    }

    /******************************************************/
    /*************** STAKING/LEAGUE FUNCTIONS *************/
    /******************************************************/
    // Returning the contracts USDC balance
    function getContractUSDCBalance() external view returns (uint256) {
        return erc20.balanceOf(address(this));
    }

    function onLeagueEnd() public onlyTeamDiff {
        uint256 contractBalance = erc20.balanceOf(address(this));

        console.log("CALCULATING LEAGUE WINNERS");
        // Calculating the winner(s) of the league
        MOBALogicLibrary.calculateLeagueWinners(
            leagueMembers,
            userToPoints,
            leagueWinners
        );

        // Splitting the prize pot in case of a tie
        uint256 prizePerWinner = contractBalance / leagueWinners.length;

        // Emitting event so we can see the winners and how much each should get
        emit leagueEnded(leagueWinners, prizePerWinner);

        for (uint256 i; i < leagueWinners.length; i++) {
            erc20.approve(address(this), prizePerWinner);
            erc20.transferFrom(address(this), leagueWinners[i], prizePerWinner);
        }
    }

    //Test function
    function getLeagueMember(uint256 index) public view returns (address) {
        return leagueMembers[index];
    }

    //****************************************************/
    //*************** LEAGUE PLAY FUNCTIONS **************/
    //****************************************************/

    // Setting the lineup for a user
    function setAthleteInLineup(uint256 athleteId, uint256 position) external {
        require(!lineupIsLocked, "lineup is locked for the week!");
        require(inLeague[msg.sender], "User is not in League.");

        // Requiring the user has ownership of the athletes
        // for (uint256 i; i < athleteIds.length; i++) {
        require(
            gameItemsContract.balanceOf(msg.sender, athleteId) > 0,
            "Caller does not own given athleteIds"
        );
        // }

        // Making sure they can't set incorrect positions (e.g. set a top where a mid should be)
        require(
            athleteId >= (position * 10) &&
                athleteId <= ((position + 1) * 10 - 1),
            "You are setting an athlete in the wrong position!"
        );

        userToLineup[msg.sender][position] = athleteId;
        //TODO add event
    }

    // User joining the league
    function joinLeague() public nonReentrant {
        require(!leagueEntryIsClosed, "League Entry is Closed!");
        require(
            (whitelistContract.whitelist(msg.sender) ||
                whitelistContract.isPublic() ||
                msg.sender == admin),
            "User is not on whitelist bro."
        );
        require(!inLeague[msg.sender], "You have already joined this league");
        require(
            erc20.balanceOf(msg.sender) > stakeAmount ||
                whitelistContract.isPublic(),
            "Insufficent funds for staking"
        );

        leagueMakerContract.updateUserToLeagueMapping(msg.sender);
        inLeague[msg.sender] = true;
        leagueMembers.push(msg.sender);
        erc20.transferFrom(msg.sender, address(this), stakeAmount);

        emit Staked(msg.sender, stakeAmount, address(this));
    }

    /*****************************************************/
    /***************** GETTER FUNCTIONS ******************/
    /*****************************************************/
    function getUserRecord(address _user)
        external
        view
        returns (uint256[8] memory)
    {
        return userToRecord[_user];
    }

    function getUserPoints(address _user) external view returns (uint256) {
        return userToPoints[_user];
    }

    function getUserWeekScore(address _user)
        external
        view
        returns (uint256[8] memory)
    {
        return userToWeekScore[_user];
    }

    function getUserLineup(address _user)
        external
        view
        returns (uint256[5] memory)
    {
        return userToLineup[_user];
    }

    function getLeagueMembersLength() external view returns (uint256) {
        return leagueMembers.length;
    }

    function getLineupIsLocked() external view returns (bool) {
        return lineupIsLocked;
    }

    function getScheduleForWeek(uint256 _week)
        external
        view
        returns (Matchup[] memory)
    {
        return schedule[_week];
    }

    function getAdmin() public view returns (address) {
        return admin;
    }

    /*****************************************************************/
    /*******************WHITELIST FUNCTIONS  *************************/
    /*****************************************************************/
    // Removing a user from the whitelist before the season starts
    function removeFromWhitelist(address _userToRemove) external onlyAdmin {
        require(
            !leagueEntryIsClosed,
            "Nobody can enter/exit the league anymore. The season has started!"
        );
        whitelistContract.removeAddressFromWhitelist(_userToRemove);
    }

    // Add user to whitelist
    function addUserToWhitelist(address _userToAdd) public onlyAdmin {
        require(
            !leagueEntryIsClosed,
            "Nobody can enter/exit the league anymore. The season has started!"
        );
        whitelistContract.addAddressToWhitelist(_userToAdd);

        //TODO this mapp contain users to league and whitelisted leagues (TODO Delete below)
        // leagueMakerContract.updateUserToLeagueMapping(_userToAdd);
        // // whitelist[_userToAdd] = true;
    }
}
