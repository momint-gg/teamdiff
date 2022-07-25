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

contract LeagueOfLegendsLogic is Initializable, ReentrancyGuard {
    using SafeMath for uint256;

    string public leagueName;
    uint256 public numWeeks; // Current week of the split
    uint256 public stakeAmount;
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
    event AthleteSetInLineup(address sender, uint256 id, uint256 position);
    event leagueEnded(address[] winner, uint256 prizePotPerWinner);
    event scheduleSet(address sender, address leagueAddress);
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

    // Only our wallet can call, need this because the "owner" of the proxy contract isn't us
    modifier onlyTeamDiffOrAdmin() {
        require(
            msg.sender == teamDiffAddress || msg.sender == admin,
            "Caller is not TeamDiff or Admin"
        );
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
        console.log("Proxy initialized!");
    }

    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ***********/
    /*************************************************/
    function setLeagueEntryIsClosed() external onlyTeamDiffOrAdmin {
        require(!leagueEntryIsClosed, "League entry has already been closed");
        leagueEntryIsClosed = true;
        MOBALogicLibrary.setLeagueSchedule(
            schedule,
            leagueMembers,
            numWeeks,
            leagueName
        );
        emit scheduleSet(msg.sender, address(this));
    }

    function lockLineup() external onlyTeamDiff {
        lineupIsLocked = true;
    }

    function unlockLineup() external onlyTeamDiff {
        lineupIsLocked = false;
    }

    // Evaluating all of the matches for a given week
    // On the last week, delegate the prize pot to the winner
    function evaluateMatches(uint256 currentWeekNum) external onlyTeamDiff {
        require(leagueEntryIsClosed, "league entry not closed, and schedule not set for this league");
        MOBALogicLibrary.evaluateMatches(
            currentWeekNum,
            athletesContract,
            userToRecord,
            userToLineup,
            userToPoints,
            userToWeekScore,
            schedule
        );
    }

    /******************************************************/
    /*************** STAKING/LEAGUE FUNCTIONS *************/
    /******************************************************/
    // Returning the contracts USDC balance
    function getContractUSDCBalance() external view returns (uint256) {
        return erc20.balanceOf(address(this));
    }

    // Called when the league is over 
    function onLeagueEnd() public onlyTeamDiff {
        uint256 contractBalance = erc20.balanceOf(address(this));

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


    //****************************************************/
    //*************** LEAGUE PLAY FUNCTIONS **************/
    //****************************************************/

    // Setting the lineup for a user
    function setAthleteInLineup(uint256 athleteId, uint256 position) external {
        require(!lineupIsLocked, "lineup is locked for the week!");
        require(inLeague[msg.sender], "User is not in League.");
        // Requiring the user has ownership of the athletes
        require(
            gameItemsContract.balanceOf(msg.sender, athleteId) > 0,
            "Caller does not own given athleteIds"
        );
        // Making sure they can't set incorrect positions (e.g. set a top where a mid should be)
        require(
            athleteId >= (position * 10) &&
                athleteId <= ((position + 1) * 10 - 1),
            "You are setting an athlete in the wrong position!"
        );

        userToLineup[msg.sender][position] = athleteId;
        emit AthleteSetInLineup(msg.sender, athleteId, position);
    }

    // User joining the league
    function joinLeague() public nonReentrant {
        require(!leagueEntryIsClosed, "League Entry is Closed!");
        require(
            (whitelistContract.whitelist(msg.sender) ||
                whitelistContract.isPublic() ||
                msg.sender == admin),
            "User is not on whitelist"
        );
        require(!inLeague[msg.sender], "You have already joined this league");
        require(
            erc20.balanceOf(msg.sender) >= stakeAmount,
            "Insufficent funds for staking"
        );

        leagueMakerContract.updateUserToLeagueMapping(msg.sender);
        inLeague[msg.sender] = true;
        leagueMembers.push(msg.sender);
        //Setting default lineups to 100 to represent unset positions
        userToLineup[msg.sender] = [100,100,100,100,100];
        erc20.transferFrom(msg.sender, address(this), stakeAmount);
        emit Staked(msg.sender, stakeAmount, address(this));
    }

    /*****************************************************/
    /***************** GETTER FUNCTIONS ******************/
    /*****************************************************/
    //Returns the result (win, loss, tie) for each week of the given user
    function getUserRecord(address _user)
        external
        view
        returns (uint256[8] memory)
    {
        return userToRecord[_user];
    }

    

    function getScheduleForWeek(uint256 _week)
        external
        view
        returns (Matchup[] memory)
    {
        return schedule[_week];
    }


    /*****************************************************************/
    /*******************WHITELIST FUNCTIONS  *************************/
    /*****************************************************************/
    function setLeagueEntryIsOpen() external onlyAdmin {
        require(leagueEntryIsClosed, "League entry is already open");
        leagueEntryIsClosed = false;
    }

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
        //update user to league mapping in leagueMaker
        leagueMakerContract.updateUserToLeagueMapping(_userToAdd);
    }

}
