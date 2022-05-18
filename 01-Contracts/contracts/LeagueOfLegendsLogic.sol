// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Athletes.sol";
import "./Whitelist.sol";
import "./LeagueMaker.sol";
import "./MOBALogicLibrary.sol";
import "./GameItems.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TestUSDC.sol";

contract LeagueOfLegendsLogic is
    Initializable,
    Ownable,
    Whitelist,
    ReentrancyGuard
{
    // Vars
    //uint256 public version; // tsting
    string public leagueName;
    uint256 public numWeeks; // Length of a split
    //uint256 public currentWeekNum; // Keeping track of week number
    // Amount that will be staked (in USDC) for each league
    uint256 public stakeAmount;
    //Note Admin will be the user, and our leaguemaker will be the owner, must grant access control
    address public admin;
    address teamDiffAddress;
    bool leagueEntryIsClosed;
    bool lineupIsLocked;

    // Mappings
    mapping(address => uint256) public userToTotalWins;
    mapping(address => uint256[8]) public userToRecord; // User to their record

    mapping(uint256 => uint256[8])  athleteToLineupOccurencesPerWeek; //checking to make sure athlete IDs only show up once per week, no playing the same NFT multiple times
    mapping(address => uint256[]) public userToLineup; // User to their lineup
    mapping(address => bool) public inLeague; // Checking if a user is in the league
    address[] public leagueMembers; // Contains league members (don't check this in requires though, very slow/gas intensive)

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
    address public polygonUSDCAddress; // When we deploy to mainnet
    address public rinkebyUSDCAddress;

    // TODO: Make contracts (Athletes, LeagueMaker, and IERC20) constant/immutable unless changing later
    // Won't want to make whitelist immutable
    // @Trey I don't think we really need to save more gas so not making these immutable (for now) for testing simplicity. Can always do this later...
    Athletes athletesContract;
    Whitelist public whitelistContract;
    LeagueMaker leagueMakerContract;
    IERC20 testUSDC;
    GameItems gameItemsContract;

    //**************/
    //*** Events ***/
    /***************/
    event Staked(address sender, uint256 amount);
    event testUSDCDeployed(address sender, address contractAddress);

    //*****************/
    //*** Modifiers ***/
    /******************/
    using SafeMath for uint256;

    // Only the admin (whoever created the league) can call
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    // Only our wallet can call, need this because the "owner" of the proxy contract isn't us
    // modifier onlyTeamDiff() {
    //     require(
    //         msg.sender == 0x3736306384bd666D6166e639Cf1b36EBaa818875,
    //         "Caller is not TeamDiff"
    //     );
    //     _;
    // }

    //Initialize all parameters of proxy
    function initialize(
        string calldata _name,
        //uint256 _version,
        //uint256 _numWeeks,
        uint256 _stakeAmount,
        bool _isPublic,
        // address athletesDataStorageAddress,
        //address _owner,
        address _admin,
        address[5] calldata constructorContractAddresses,
        // address _polygonUSDCAddress,
        // address _rinkebyUSDCAddress,
        // address _testUSDCAddress,
        // address leagueMakerContractAddress
        // address gameItemsContractAddress
        address[] calldata whitelistUsers
    ) public initializer {
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        leagueName = _name;
        //numWeeks = _numWeeks;
        numWeeks = 8;
        inLeague[_admin] = true;
        leagueMembers.push(_admin);
        admin = _admin;
        stakeAmount = _stakeAmount;
        isPublic = _isPublic;
        lineupIsLocked = false;
        leagueEntryIsClosed = false;
        athletesContract = Athletes(constructorContractAddresses[3]);
        leagueMakerContract = LeagueMaker(constructorContractAddresses[4]);
        whitelistContract = new Whitelist(); // Initializing our whitelist (not immutable)
        whitelistContract.addAddressesToWhitelist(whitelistUsers);
        polygonUSDCAddress = constructorContractAddresses[0];
        rinkebyUSDCAddress = constructorContractAddresses[1];
        testUSDC = IERC20(constructorContractAddresses[2]);
        //gameItemsContract = GameItems(gameItemsContractAddress);
        //gameItemsContract = address(0);
        console.log("Proxy initialized!");
    }

    //event versionIncremented(uint256 newVersion);
    // function incrementVersion() public {
    //     version += 1;
    // }

    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ******userToLeagueuserToLeague*****/
    /*************************************************/
    //TODO: Change functions to onlyTeamDiff for deployment (when testing on Rinkeby, only Admin for hardhat)
    //TODO change to only owner for prod
    function setLeagueSchedule() external {
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
    function evaluateWeek(uint256 currentWeekNum) external onlyOwner {
        //uint256 currentWeekNum = leagueMakerContract.currentWeek();
        MOBALogicLibrary.evaluateWeek(
            schedule,
            currentWeekNum,
            athletesContract,
            userToRecord,
            userToTotalWins,
            userToLineup
        );
    }

    // Evaluates match between two users, only we can call
    // TODO: Comment out for prod
    // function evaluateMatch(address addr1, address addr2)
    //     external
    //     onlyOwner
    //     returns (address)
    // {
    //     return
    //         MOBALogicLibrary.evaluateMatch(
    //             addr1,
    //             addr2,
    //             currentWeekNum,
    //             athletesContract,
    //             userToLineup[addr1],
    //             userToLineup[addr2],
    //             userToRecord,
    //             userToTotalWins
    //         );
    // }

    function onLeagueEnd() external onlyOwner nonReentrant {
        uint256 contractBalance = stakeAmount * leagueMembers.length;
        address winner = leagueMembers[0];
        // Calculating the winner (may want to just update each week instead of doing this way...)
        // Save gas: don't say i = 0
        for (uint256 i = 1; i < leagueMembers.length; i++) {
            if (userToTotalWins[leagueMembers[i]] > userToTotalWins[winner]) {
                winner = leagueMembers[i];
            }
        }
        // Approval on front end first, then transfer with the below
        testUSDC.transferFrom(address(this), winner, contractBalance);
    }

    /************************************************/
    /***************** GETTERS **********************/
    /************************************************/


    //Returns total pot of the league
    // function getTotalPrizePot() external view returns (uint256) {
    //     return stakeAmount * leagueMembers.length;
    // }

    /******************************************************/
    /***************** STAKING FUNCTIONS ******************/
    /******************************************************/

    // Returning the contracts USDC balance
    // function getUSDCBalance() external view returns (uint256) {
    //     require(inLeague[msg.sender]);
    //     return testUSDC.balanceOf(address(this));
    // }

    // Returning the sender's USDC balance (testing)
    function getUserUSDCBalance() external view returns (uint256) {
        require(inLeague[msg.sender]);
        return testUSDC.balanceOf(msg.sender);
    }

    //***************************************************/
    //*************** LEAGUE PLAY FUNCTION **************/
    //***************************************************/
    // Setting the lineup for a user
    // Lineup must not be locked
    // How do we check that the user owners the athletiIds??
    function setLineup(uint256[] memory athleteIds) external {
        require(!lineupIsLocked, "lineup is locked for the week!");
        require(inLeague[msg.sender], "user is not in League");
        uint256 currentWeek = leagueMakerContract.currentWeek();
        //TODO move the following checks into a library somehow, cost about 1 kb of contract space :/
        //Decrement all athleteToLineup Occurences from previous lineup
        for(uint256 i; i < userToLineup[msg.sender].length; i++) {
            athleteToLineupOccurencesPerWeek[userToLineup[msg.sender][i]][currentWeek]--;
        }
        //require ownership of all athleteIds + update athleteToLineOccurencesMapping
        for(uint256 i; i < athleteIds.length; i++) {
            athleteToLineupOccurencesPerWeek[i][currentWeek]++;
            //gameItemsContract.mintAthlete(athleteIds[i]);
            // console.log("in set lineup");
            // console.log(gameItemsContract.balanceOf(msg.sender, athleteIds[i]));
            require(gameItemsContract.balanceOf(msg.sender, athleteIds[i]) > 0, "Caller does not own given athleteIds");
        }
        //require non-duplicate IDs
        for(uint256 i; i < athleteIds.length; i++) {
            require(athleteToLineupOccurencesPerWeek[i][currentWeek] == 1, "Duplicate athleteIDs are not allowed.");
        }

        userToLineup[msg.sender] = athleteIds;
    }


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
    // Add user to league -- only testing, not using this
    //TODO comment out for prod
    // function addUserToLeague(address user) public {
    //     require(!leagueEntryIsClosed, "League Entry is Closed!");

    //     if (leagueMembers.length < 8) {
    //         leagueMembers.push(user);
    //         leagueMakerContract.updateUserToLeagueMapping(user);
    //     } else {
    //         console.log("Too many users in league to add new user.");
    //     }
    // }

    // User joining the league
    function joinLeague() external nonReentrant {
    // function joinLeague() external onlyWhitelisted nonReentrant {
        require(whitelistContract.whitelist(msg.sender), "User is not on whitelist bro");
        require(!leagueEntryIsClosed, "League Entry is Closed!");
        require(!inLeague[msg.sender], "You have already joined this league");
        require(testUSDC.balanceOf(msg.sender) > stakeAmount, "Insufficent funds for staking");
        
        
        inLeague[msg.sender] = true;
        leagueMembers.push(msg.sender);

        testUSDC.transferFrom(msg.sender, address(this), stakeAmount);
        emit Staked(msg.sender, stakeAmount);
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
        whitelistContract.addAddressToWhitelist(_userToAdd);
        //TODO this mapp contain users to league and whitelisted leagues
        leagueMakerContract.updateUserToLeagueMapping(_userToAdd);
        // whitelist[_userToAdd] = true;
    }
}
