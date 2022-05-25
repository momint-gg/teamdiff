// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Athletes.sol";
import "./Whitelist.sol";
import "./LeagueMaker.sol";
import "./MOBALogicLibrary.sol";
import "./GameItems.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TestUSDC.sol";

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

    mapping(uint256 => uint256[8]) athleteToLineupOccurencesPerWeek; //checking to make sure athlete IDs only show up once per week, no playing the same NFT multiple times
    mapping(address => uint256[]) public userToRecord; // User to their record
    mapping(address => uint256[]) public userToLineup; // User to their lineup
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
    // address public polygonUSDCAddress = ; // When we deploy to mainnet
    address public rinkebyUSDCAddress;

    // TODO: Make contracts (Athletes, LeagueMaker, and IERC20) constant/immutable unless changing later
    // Won't want to make whitelist immutable
    // @Trey I don't think we really need to save more gas so not making these immutable (for now) for testing simplicity. Can always do this later...
    Athletes athletesContract;
    Whitelist public whitelistContract;
    LeagueMaker leagueMakerContract;
    // IERC20 public testUSDC;
    IERC20 public rinkebyUSDC;
    GameItems gameItemsContract;

    //**************/
    //*** Events ***/
    /***************/
    event Staked(address sender, uint256 amount);
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
        // address _polygonUSDCAddress, // This doesn't need to be a parameter passed in
        address _rinkebyUSDCAddress,
        address _testUSDCAddress,
        address _gameItemsContractAddress,
        address _teamDiffAddress,
        address _leagueMakerContractAddress
    ) public initializer {
        leagueName = _name;
        numWeeks = 8;
        // Setting up the admin role
        //inLeague[_admin] = true;
        //leagueMembers.push(_admin);
        admin = _admin;
        stakeAmount = _stakeAmount;
        // isPublic = _isPublic;
        leagueEntryIsClosed = false;
        lineupIsLocked = false;
        athletesContract = Athletes(athletesDataStorageAddress);
        leagueMakerContract = LeagueMaker(_leagueMakerContractAddress);
        whitelistContract = new Whitelist(_isPublic); // Initializing our whitelist
        rinkebyUSDC = IERC20(_rinkebyUSDCAddress);
        // testUSDC = IERC20(_testUSDCAddress);
        teamDiffAddress = _teamDiffAddress;
        gameItemsContract = GameItems(_gameItemsContractAddress);
        // adminStake(_admin); // Moving admin stake to leaguemaker bc admin will be sender
        console.log("Proxy initialized!");
    }

    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ******userToLeagueuserToLeague*****/
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
            schedule
        );

        // League is over (8 weeks)
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
        return rinkebyUSDC.balanceOf(address(this));
    }

    // // Returning the sender's USDC balance (testing)
    // function getUserUSDCBalance() external view returns (uint256) {
    //     require(inLeague[msg.sender]);
    //     return testUSDC.balanceOf(msg.sender);
    // }

    // // User joining the league
    // function joinLeague() external onlyWhitelisted nonReentrant {
    //     require(!leagueEntryIsClosed, "League Entry is Closed!");
    //     require(!inLeague[msg.sender], "You have already joined this league");
    //     require(
    //         testUSDC.balanceOf(msg.sender) > stakeAmount,
    //         "Insufficent funds for staking"
    //     );

    //     inLeague[msg.sender] = true;
    //     leagueMembers.push(msg.sender);

    //     testUSDC.transferFrom(msg.sender, address(this), stakeAmount);
    //     emit Staked(msg.sender, stakeAmount);
    // }

    // // TODO: Change to private/internal (public for testing)
    function onLeagueEnd() public onlyTeamDiff {
        uint256 contractBalance = leagueMembers.length * stakeAmount; // TODO change to balance of function? Might be a bit more foolproof...

        // Calculating the winner(s)
        MOBALogicLibrary.calculateLeagueWinners(
            leagueMembers,
            userToPoints,
            leagueWinners
        );

        for (uint256 i; i < leagueWinners.length; i++) {
            console.log(leagueWinners[i]);
        }

        // Splitting the prize pot in case of a tie
        uint256 prizePerWinner = contractBalance / leagueWinners.length;
        console.log("League winners len is ", leagueWinners.length);
        console.log("Prize per winner is : ", prizePerWinner);

        // Emitting event so we can see the winners and how much each should get
        emit leagueEnded(leagueWinners, prizePerWinner);

        for (uint256 i; i < leagueWinners.length; i++) {
            // Approval first, then transfer with the below
            rinkebyUSDC.approve(address(this), prizePerWinner);
            rinkebyUSDC.transferFrom(
                address(this),
                leagueWinners[i],
                prizePerWinner
            );
        }
    }

    //Test function
    function getLeagueMember(uint256 index) public view returns (address) {
        return leagueMembers[index];
    }

    //***************************************************/
    //*************** LEAGUE PLAY FUNCTION **************/
    //***************************************************/
    // Setting the lineup for a user
    // TODO: Move requires to a library to save space (MOBALogicLibrary)
    function setLineup(uint256[] memory athleteIds) external {
        require(!lineupIsLocked, "lineup is locked for the week!");
        require(inLeague[msg.sender], "User is not in League.");

        //Decrement all athleteToLineup Occurences from previous lineup
        for (uint256 i; i < userToLineup[msg.sender].length; i++) {
            athleteToLineupOccurencesPerWeek[userToLineup[msg.sender][i]][
                currentWeekNum
            ]--;
        }

        // Require ownership of all athleteIds + update mapping
        for (uint256 i; i < athleteIds.length; i++) {
            athleteToLineupOccurencesPerWeek[athleteIds[i]][currentWeekNum]++;
        }

        // Requiring the user has ownership of the athletes
        for (uint256 i; i < athleteIds.length; i++) {
            require(
                gameItemsContract.balanceOf(msg.sender, athleteIds[i]) > 0,
                "Caller does not own given athleteIds"
            );
        }

        // Making sure they can't set incorrect positions (e.g. set a top where a mid should be)
        for (uint256 i; i < athleteIds.length; i++) {
            require( // In range 0-9, 10-19, etc. (Unique positions are in these ranges)
                athleteIds[i] >= (i * 10) &&
                    athleteIds[i] <= ((i + 1) * 10 - 1),
                "You are setting an athlete in the wrong position!"
            );
        }

        userToLineup[msg.sender] = athleteIds;
    }

    /*****************************************************/
    /***************** GETTER FUNCTIONS ******************/
    /*****************************************************/
    // Getter for user to weekly pts
    // When we get the mapping directly, returns incorrectly so we need to keep this!
    function getUserRecord() external view returns (uint256[] memory) {
        return userToRecord[msg.sender];
    }

    // For testing if join league function Works
    // function getUsersLength() external view returns (uint256) {
    //     return leagueMembers.length;
    // }

    // Getting lineupIsLocked (TODO: Comment out for prod)
    function getLineupIsLocked() external view returns (bool) {
        return lineupIsLocked;
    }

    // You need to call an index when getting a mapping. More convenient to have a getter so we can return whole lineup
    function getLineup(address _user) public view returns (uint256[] memory) {
        return userToLineup[_user];
    }

    // User joining the league
    //TODO debug why onlyWhiteListed always reverts
    function joinLeague() public nonReentrant {
    // function joinLeague() external onlyWhitelisted nonReentrant {
        require((whitelistContract.whitelist(msg.sender) || msg.sender == admin), "User is not on whitelist bro");
        require(!leagueEntryIsClosed, "League Entry is Closed!");
        require(!inLeague[msg.sender], "You have already joined this league");
        require(rinkebyUSDC.balanceOf(msg.sender) > stakeAmount, "Insufficent funds for staking");
        
        //must approve for our own token
        //testUSDC.approve(msg.sender, 100);

        
        inLeague[msg.sender] = true;
        leagueMembers.push(msg.sender);
        rinkebyUSDC.transferFrom(msg.sender, address(this), stakeAmount);
        // rinkebyUSDC.transfer(address(this), stakeAmount);
        emit Staked(msg.sender, stakeAmount);
    }

    
    // Getting a schedule for a week
    function getScheduleForWeek(uint256 _week)
        external
        view
        returns (Matchup[] memory)
    {
        return schedule[_week];
    }

    // Returning the admin for the league (for testing)
    // function getAdmin() public view returns (address) {
    //     return admin;
    // }

    /*****************************************************************/
    /*******************WHITELIST FUNCTIONS  *************************/
    /*****************************************************************/
    // Removing a user from the whitelist before the season starts
    // function removeFromWhitelist(address _userToRemove) external onlyAdmin {
    //     require(
    //         !leagueEntryIsClosed,
    //         "Nobody can enter/exit the league anymore. The season has started!"
    //     );
    //     whitelistContract.removeAddressFromWhitelist(_userToRemove);
    // }

    // Add user to whitelist
    function addUserToWhitelist(address _userToAdd) public onlyAdmin {
        // require(
        //     !leagueEntryIsClosed,
        //     "Nobody can enter/exit the league anymore. The season has started!"
        // );
        whitelistContract.addAddressToWhitelist(_userToAdd);
        //TODO this mapp contain users to league and whitelisted leagues
        leagueMakerContract.updateUserToLeagueMapping(_userToAdd);
        // whitelist[_userToAdd] = true;
    }
}
