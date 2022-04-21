// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Athletes.sol";
import "./Whitelist.sol";
import "./LeagueMaker.sol";
import "./MOBALogicLibrary.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TestUSDC.sol";

// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
//TODO create a "MOBALogic" helper contract?
contract LeagueOfLegendsLogic is
    Initializable,
    Ownable,
    AccessControl,
    Whitelist
{
    // Vars
    //uint256 public version; // tsting
    string public leagueName;
    uint256 public numWeeks; // Length of a split
    uint256 public currentWeekNum; // Keeping track of week number
    // Amount that will be staked (in USDC) for each league
    uint256 public stakeAmount;
    address[] public leagueMembers;

    //Note Admin will be the user, and our leaguemaker will be the owner, must grant access control
    address admin;
    bool leagueEntryIsClosed;
    bool lineupIsLocked;
    //Maps each league member to the running count of their total wins
    mapping(address => uint256) userToTotalWins;
    //Maps each league member to an array that represents a win or loss for each week
    //TODO add logic for bye week?
    //bye = 2?
    //win = 1?
    //loss = 0
    mapping(address => uint256[8]) public userToRecord;
    //TODO can we set this to a fixed size line up array of size 5?
    mapping(address => uint256[]) userLineup;
    //uint256 private totalSupply;// Total supply of USDC
    //uint256 public stakeAmount; // Amount that will be staked (in USDC) for each league

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
    address public polygonUSDCAddress; // When we deploy to mainnet
    address public rinkebyUSDCAddress;

    // TODO: Make contracts (Athletes, LeagueMaker, and IERC20) constant/immutable unless changing later
    // Won't want to make whitelist immutable
    Athletes athletesContract;
    Whitelist whitelistContract;
    LeagueMaker leagueMakerContract;
    // MOBALogicHelper mobaLogicHelper;
    IERC20 testUSDC;

    //**************/
    //*** Events ***/
    /***************/
    event Staked(address sender, uint256 amount);
    event testUSDCDeployed(address sender, address contractAddress);

    //*****************/
    //*** Modifiers ***/
    /******************/
    using SafeMath for uint256;

    /**
     * @dev Throws if called by any account that's not Admin
     * The creator of the league will be set to Admin, and have admin privileges
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    // modifier onlyAdmin() {
    //     // In our case, whitelisted can also mean nobody has been added to the whitelist and nobody besides the league creator
    //     require(
    //         hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
    //         "Caller is not the admin"
    //     );
    //     _;
    // }

    //Initialize all parameters of proxy
    function initialize(
        string calldata _name,
        //uint256 _version,
        uint256 _numWeeks,
        uint256 _stakeAmount,
        bool _isPublic,
        address athletesDataStorageAddress,
        //address _owner,
        address _admin,
        address _polygonUSDCAddress,
        address _rinkebyUSDCAddress,
        address _testUSDCAddress, // need to use testUSDC to be able to test on hardhat
        address leagueMakerContractAddress
    ) public initializer {
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        leagueName = _name;
        numWeeks = uint256(8);
        //currentWeekNum = uint256(0);
        //totalSupply = uint256(0);
        _setupRole(DEFAULT_ADMIN_ROLE, _admin); // This isn't working for some reason @Trey so I am editing the modifier
        leagueMembers.push(_admin);
        admin = _admin;
        stakeAmount = _stakeAmount;
        isPublic = _isPublic;
        lineupIsLocked = false;
        leagueEntryIsClosed = false;
        //stake(rinkebyUSDCAddress, stakeAmount);
        athletesContract = Athletes(athletesDataStorageAddress);
        leagueMakerContract = LeagueMaker(leagueMakerContractAddress);
        whitelistContract = new Whitelist(); // Initializing our whitelist
        polygonUSDCAddress = _polygonUSDCAddress;
        rinkebyUSDCAddress = _rinkebyUSDCAddress;
        // testUSDC = TestUSDC(_testUSDCAddress);
        testUSDC = IERC20(_testUSDCAddress);
        console.log("Proxy initialized!");
    }

    //event versionIncremented(uint256 newVersion);
    // function incrementVersion() public {
    //     version += 1;
    // }

    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ***********/
    /*************************************************/

    function setLeagueSchedule() external onlyOwner {
        console.log("setting schedule");
        MOBALogicLibrary.setLeagueSchedule(
            schedule,
            leagueMembers,
            numWeeks,
            leagueName
        );
    }

    function setLeagueEntryIsClosed() external onlyOwner {
        leagueEntryIsClosed = true;
    }

    function lockLineup() external onlyOwner {
        lineupIsLocked = true;
    }

    function unlockLineup() external onlyOwner {
        lineupIsLocked = false;
    }

    //Evalautes all matchups for a given week
    function evaluateWeek() external onlyOwner {
        MOBALogicLibrary.evaluateWeek(
            schedule,
            currentWeekNum,
            athletesContract,
            userToRecord,
            userToTotalWins,
            userLineup
        );
    }

    // Evaluates match between two users
    function evaluateMatch(address addr1, address addr2)
        external
        returns (address)
    {
        return
            MOBALogicLibrary.evaluateMatch(
                addr1,
                addr2,
                currentWeekNum,
                athletesContract,
                userLineup[addr1],
                userLineup[addr2],
                userToRecord,
                userToTotalWins
            );
    }

    // On security:
    // Add a reentrancy guard -- use nonreentrant modifier (should have for staking)
    // OpenZeppelin has library for this
    // Delegates the prize pool for the league (for now, entire stake amount goes to the winner but we can change that)
    function onLeagueEnd() external onlyAdmin {
        uint256 contractBalance = stakeAmount * leagueMembers.length;
        address winner;
        // Calculating the winner (may want to just update each week instead of doing this way...)
        // Save gas: don't say i = 0
        for (uint256 i; i < leagueMembers.length; i++) {
            if (userToTotalWins[leagueMembers[i]] > userToTotalWins[winner]) {
                winner = leagueMembers[i];
            }
        }
        // Approval on front end first, then transfer with the below
        testUSDC.transferFrom(msg.sender, address(this), contractBalance);
    }

    /************************************************/
    /***************** GETTERS **********************/
    /************************************************/
    function getVersion() external pure returns (uint256 version) {
        return version;
    }

    function getLeagueName() external view returns (string memory) {
        return leagueName;
    }

    function getStakeAmount() external view returns (uint256) {
        return stakeAmount;
    }

    //Returns total pot of the league
    function getTotalPrizePot() external view returns (uint256) {
        return stakeAmount * leagueMembers.length;
    }

    // Returning the lineup for a user
    function getLineup() external view returns (uint256[] memory) {
        return userLineup[msg.sender];
    }

    // Getting the test usdc contract address (for testing)
    function getTestUSDCAddress() external view returns (address) {
        return address(testUSDC);
    }

    // Getting the admin address to make sure it was set correctly
    function getAdmin() external view returns (address) {
        return admin;
    }

    // Getting the athletes contract address
    function getAthleteContractAddress() external view returns (address) {
        return address(athletesContract);
    }

    // Gets the current week #
    function getCurrentWeekNum() external view returns (uint256) {
        return currentWeekNum;
    }

    /******************************************************/
    /***************** STAKING FUNCTIONS ******************/
    /******************************************************/

    // Returning the contracts USDC balance
    function getUSDCBalance() external view returns (uint256) {
        // Todo for mainnet: replace return statement with the commented out statement
        // return IERC20(polygonUSDCAddress).balanceOf(address(this));

        return testUSDC.balanceOf(address(this));
    }

    // Returning the sender's USDC balance (testing)
    function getUserUSDCBalance() external view returns (uint256) {
        // Todo for mainnet: replace return statement with the commented out statement
        // return IERC20(polygonUSDCAddress).balanceOf(msg.sender);

        return testUSDC.balanceOf(msg.sender);
    }

    //***************************************************/
    //*************** LEAGUE PLAY FUNCTION **************/
    //***************************************************/
    // Setting the lineup for a user
    // Lineup must not be locked
    function setLineup(uint256[] memory athleteIds) external {
        require(!lineupIsLocked, "lineup is locked for the week!");
        userLineup[msg.sender] = athleteIds;
    }

    // Getter for user to total pts
    // function getUserTotalWins()   public view returns (uint256) {
    //     //return userToTotalWins[msg.sender];
    //     uint256 winSum = 0;
    //     uint256 currentWeekNum = leagueMakerContract.currentWeek();
    //     for(uint256 i = 0; i <= currentWeekNum; i++) {
    //         winSum += userToRecord[msg.sender][i];
    //     }
    //     return winSum;
    // }

    // Getter for user to weekly pts
    function getUserRecord() external view returns (uint256[8] memory) {
        return userToRecord[msg.sender];
    }

    // For testing if join league function Works
    function getUsersLength() external view returns (uint256) {
        return leagueMembers.length;
    }

    // Getter for user to total pts
    function getUserTotalPts() external view returns (uint256) {
        return userToTotalWins[msg.sender];
    }

    //Given manually inputted athlete stats, return the calculated
    //athleteScores.
    // //Allows verification of our off-chain calculations
    // function calculateScoreOnChain(Stats calldata athleteStats)
    //     pure
    //     public
    //     returns (uint256 score)  {
    //     //calculate score with given stats
    //     //placeholder lol
    //     return athleteStats.kills * 2;
    // }

    /*****************************************************************/
    /*******************LEAGUE MEMBERSHIP FUNCTIONS  *****************/
    /*****************************************************************/
    // Add user to league
    //for testing only
    function addUserToLeague(address user) external onlyOwner {
        require(!leagueEntryIsClosed, "League Entry is Closed!");

        if (leagueMembers.length < 8) {
            leagueMembers.push(user);
            leagueMakerContract.updateUserToLeagueMapping(user);
        } else {
            console.log("Too many users in league to add new user.");
        }
    }

    // User joining the league
    function joinLeague() external onlyWhitelisted {
        require(!leagueEntryIsClosed, "League Entry is Closed!");

        //TODO check leagueSize on frontend instead to ensure this operation is valid
        leagueMembers.push(msg.sender); // Maybe change this later to a map if it's gas inefficient as an array/list

        // Todo for mainnet: replace transferFrom staement with commented out (remember to prompt for approval of transaction on frontend!)
        // IERC20(polygonUSDCAddress).transferFrom(msg.sender, address(this), stakeAmount)
        testUSDC.transferFrom(msg.sender, address(this), stakeAmount);
        emit Staked(msg.sender, stakeAmount);
    }

    // Removing a user from the league
    function removeFromLeague(address _userToRemove) external onlyAdmin {
        require(
            !leagueEntryIsClosed,
            "Nobody can enter/exit the league anymore. The season has started!"
        );

        whitelistContract.removeAddressFromWhitelist(_userToRemove);
    }

    // Add user to whitelist
    function addUserToWhitelist(address _userToAdd) external onlyAdmin {
        whitelistContract.addAddressToWhitelist(_userToAdd);
        // whitelist[_userToAdd] = true;
    }
}
