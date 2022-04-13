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


contract  LeagueOfLegendsLogic is Initializable, Ownable, AccessControl, Whitelist {
    
    //*******************/
    // MUTABLE STORAGE  */
    /********************/
    //uint256 public version; // tsting
    string public leagueName;
    uint256 public numWeeks; // Length of a split
    uint256 public currentWeekNum; // Keeping track of week number
    // Amount that will be staked (in USDC) for each league
    uint256 public stakeAmount; 
    address[] public leagueMembers;
    address admin;
    bool leagueEntryIsClosed;
    bool lineupIsLocked;
    //Maps each league member to the running count of their total wins
    mapping(address => uint256) userToTotalWins;
    //Maps each league member to an array that represents a win or loss for each week
    mapping(address => uint256[8]) public userToRecord;
    //TODO can we set this to a fixed size line up array of size 5?
    mapping(address => uint256[]) userLineup;

    // Schedule for the league (generated before), maps week # => [matchups]
    struct Matchup {
        address[2] players;
    }
     mapping(uint256 => Matchup[])  schedule; 
    
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
    // Our Athletes.sol contract
    Athletes athletesContract;
    // Our Whitelist contract
    Whitelist whitelistContract;
    // Our LeagueMaker contract
    LeagueMaker leagueMakerContract;

    //**************/
    //*** Events ***/
    /***************/
    event Staked(address sender, uint256 amount);
    // event MatchResult(address winner, address loser);

    //*****************/
    //*** Modifiers ***/
    /******************/
    using SafeMath for uint256;

    /**
     * @dev Throws if called by any account that's not Admin
     * The creator of the league will be set to Admin, and have admin privileges
     */
    modifier onlyAdmin() {
        // In our case, whitelisted can also mean nobody has been added to the whitelist and nobody besides the league creator
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender));
        _;
    }



    //Initialize all parameters of proxy
    function initialize(
        string calldata _name,
        uint256 _stakeAmount,
        bool _isPublic,
        address athletesDataStorageAddress,
        address _admin, 
        address _polygonUSDCAddress,
        address _rinkebyUSDCAddress,
        address leagueMakerContractAddress
        ) 
         
        public initializer {
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        leagueName = _name;
        numWeeks = uint256(8);
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        leagueMembers.push(_admin);
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
        console.log("Proxy initialized!");
    }


    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ***********/
    /*************************************************/
    //TODO set to only owner
    //Only set to public for testing purposes for now
    function setLeagueSchedule() 
        external
        onlyOwner
    {
        console.log("setting schedule");
        MOBALogicLibrary.setLeagueSchedule(schedule, leagueMembers, numWeeks, leagueName);
    }
    
    function setLeagueEntryIsClosed() 
        external 
        onlyOwner
    {
        leagueEntryIsClosed = true;
    }

    function lockLineup()
        external
        onlyOwner
    {
        lineupIsLocked = true;
    }

    function unlockLineup()
        external
        onlyOwner
    {
        lineupIsLocked = false;
    }
    

    // Setting the address for our athlete contract
    //TODO do we need this?
    function setAthleteContractAddress(address _athleteContractAddress)
        public
        onlyOwner
    {
        athletesContract = Athletes(_athleteContractAddress);
    }

    //Evalautes all matchups for a given week
    function evaluateWeek() 
        public
        onlyOwner
    {
       MOBALogicLibrary.evaluateWeek(schedule, currentWeekNum, athletesContract, userToRecord, userToTotalWins, userLineup);
    }
    

    /************************************************/
    /***************** GETTERS **********************/
    /************************************************/
    // function getVersion() view public returns (uint256 version) {
    //     return version;
    // }

    function getLeagueName() view public returns (string memory) {
        return leagueName;
    }

    function getStakeAmount() view public returns (uint256) {
        return stakeAmount;
    }

    //Returns total pot of the league
    function getTotalPrizePot() view public returns (uint256) {
        return stakeAmount * leagueMembers.length;
    }

        // Returning the lineup for a user
    function getLineup()   view public returns (uint256[] memory) {
        return userLineup[msg.sender];
    }


    /******************************************************/
    /***************** STAKING FUNCTIONS ******************/
    /******************************************************/

    // User staking the currency
    // I think this means they won't be able to stake decimal amounts
    function stake(address _token, uint256 amount) internal {
        require(amount > 0, "Cannot stake 0");
        //totalSupply = totalSupply.add(amount);
        // _balances[msg.sender] = _balances[msg.sender].add(amount);
        // Before this you should have approved the amount
        // This will transfer the amount of  _token from caller to contract
        IERC20(_token).transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    // Returning the contracts USDC balance
    function getUSDCBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }





    //***************************************************/
    //*************** LEAGUE PLAY FUNCTION **************/
    //***************************************************/
    // Setting the lineup for a user
    //Lineup must not be locked
    function setLineup(uint256[] memory athleteIds)   public {
        require(!lineupIsLocked, "lineup is locked for the week!");
        userLineup[msg.sender] = athleteIds;
    }


    // Getter for user to weekly pts
    function getUserRecord()   public view returns (uint256[8] memory) {
        return userToRecord[msg.sender];
    }



    /*****************************************************************/
    /*******************LEAGUE MEMBERSHIP FUNCTIONS  *****************/
    /*****************************************************************/
    // Add user to league
    //for testing only
    function addUserToLeague(address user) public {
        require(!leagueEntryIsClosed, "League Entry is Closed!");
        if(leagueMembers.length < 8) {
            leagueMembers.push(user);
            leagueMakerContract.updateUserToLeagueMapping(user);
        }
        else {
            console.log("too many users in league to add new user");
        }
    }

    // User joining the league
    function joinLeague() public onlyWhitelisted {
        require(!leagueEntryIsClosed, "League Entry is Closed!");

        //TODO check leagueSize on frontend instead to ensure this operation is valid
        leagueMembers.push(msg.sender); // Maybe change this later to a map if it's gas inefficient as an array
        stake(rinkebyUSDCAddress, stakeAmount);

    }

    // // TODO: Should we write this or just make it so that you can't leave once you join?
    // function removeFromLeague() public onlyWhitelisted {}


    // // Add user to whitelist
    function addUserToWhitelist() public onlyAdmin {
        whitelist[msg.sender] = true;
    }

        //TODO
    //1.) View function to calculate score on-chain for a given line-up and week (not started)
    //2.) Pool Prize mechanics (in progress)
    //3.) League membership mechanics (testing)
    //4.) League schedule creation mechanics (testing)
    //5.) lock set line-up with onlyOwner function (testing)

    //TODO Henry:
    // Add whitelist logic
    // List of users that can join league, if you join the league
    // When user joins league they pay an amount set by the league admin (payable function)
    // Amount is in USDC
    // Initially set by the league owner, cannot be reset
    // If user is whitelisted, then they can join the league
    // If whitelist has a length of 0 then ignore whitelist, anyone can join the league

    // Start prize pool mechanics
}
