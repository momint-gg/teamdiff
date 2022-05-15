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

contract LeagueOfLegendsLogic is Initializable, Whitelist, ReentrancyGuard {
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
    // address public polygonUSDCAddress = ; // When we deploy to mainnet
    address public rinkebyUSDCAddress;

    // TODO: Make contracts (Athletes, LeagueMaker, and IERC20) constant/immutable unless changing later
    // Won't want to make whitelist immutable
    Athletes athletesContract;
    Whitelist whitelistContract;
    LeagueMaker leagueMakerContract;
    IERC20 public testUSDC;
    GameItems gameItemsContract;
    address leagueMakerLibraryAddress;

    //**************/
    //*** Events ***/
    /***************/
    event Staked(address sender, uint256 amount);
    event testUSDCDeployed(address sender, address contractAddress);
    event leagueEnded(address winner);

    //*****************/
    //*** Modifiers ***/
    /******************/

    // Only the admin (whoever created the league) can call
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    // the fuctions only the league maker library should be able to call
    modifier onlyLeagueMakerLibrary() {
        require(
            msg.sender == leagueMakerLibraryAddress,
            "Caller is not the League Maker Library"
        );
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
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        leagueName = _name;
        numWeeks = 8;
        // Setting up the admin role
        inLeague[_admin] = true;
        leagueMembers.push(_admin);
        admin = _admin;
        stakeAmount = _stakeAmount;
        isPublic = _isPublic;
        leagueEntryIsClosed = false;
        lineupIsLocked = false;
        athletesContract = Athletes(athletesDataStorageAddress);
        leagueMakerContract = LeagueMaker(_leagueMakerContractAddress);
        whitelistContract = new Whitelist(); // Initializing our whitelist (not immutable)
        rinkebyUSDCAddress = _rinkebyUSDCAddress;
        testUSDC = IERC20(_testUSDCAddress);
        teamDiffAddress = _teamDiffAddress;
        gameItemsContract = GameItems(_gameItemsContractAddress);
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
            schedule
        );

        // League is over (8 weeks)
        if (currentWeekNum == numWeeks - 1) {
            onLeagueEnd();
            break;
        }
        currentWeekNum++;
    }

    // TODO: Change to private/internal
    // TODO: Add tiebraker logic here (split the pot)
    function onLeagueEnd() public onlyTeamDiff {
        uint256 contractBalance = stakeAmount * leagueMembers.length;
        address winner = leagueMembers[0];
        // Calculating the winner (may want to just update each week instead of doing this way...)
        // Save gas: don't say i = 0
        // Todo: Call MOBALogicLibrary calculateLeagueWinner function
        // for (uint256 i = 1; i < leagueMembers.length; i++) {
        //     if (userToTotalWins[leagueMembers[i]] > userToTotalWins[winner]) {
        //         winner = leagueMembers[i];
        //     }
        // }
        // Approval on front end first, then transfer with the below
        testUSDC.transferFrom(address(this), winner, contractBalance);

        // emit leagueEnded(winner);
    }

    /******************************************************/
    /***************** STAKING FUNCTIONS ******************/
    /******************************************************/

    // Returning the contracts USDC balance
    function getUSDCBalance() external view returns (uint256) {
        require(inLeague[msg.sender]);
        return testUSDC.balanceOf(address(this));
    }

    // Returning the sender's USDC balance (testing)
    function getUserUSDCBalance() external view returns (uint256) {
        require(inLeague[msg.sender]);
        return testUSDC.balanceOf(msg.sender);
    }

    //***************************************************/
    //*************** LEAGUE PLAY FUNCTION **************/
    //***************************************************/
    // Setting the lineup for a user
    function setLineup(uint256[] memory athleteIds) external {
        require(!lineupIsLocked, "lineup is locked for the week!");
        require(inLeague[msg.sender], "User is not in League.");

        uint256 currentWeek = leagueMakerContract.currentWeek();

        //Decrement all athleteToLineup Occurences from previous lineup
        for (uint256 i; i < userToLineup[msg.sender].length; i++) {
            athleteToLineupOccurencesPerWeek[userToLineup[msg.sender][i]][
                currentWeek
            ]--;
        }

        // Require ownership of all athleteIds + update mapping
        for (uint256 i; i < athleteIds.length; i++) {
            athleteToLineupOccurencesPerWeek[athleteIds[i]][currentWeek]++;
        }
        // The below check won't work because there's no way to make sure athletes aren't repeated in each league (as of now)
        // Require non-duplicate athlete IDs in league
        // for (uint256 i; i < athleteIds.length; i++) {
        //     require(
        //         athleteToLineupOccurencesPerWeek[athleteIds[i]][currentWeek] ==
        //             1,
        //         "Duplicate athleteIDs are not allowed."
        //     );
        // }

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
    function getUsersLength() external view returns (uint256) {
        return leagueMembers.length;
    }

    // Getter for user to total pts
    function getUserTotalPts() external view returns (uint256) {
        return userToTotalWins[msg.sender];
    }

    // Getting lineupIsLocked (TODO: Comment out for prod)
    function getLineupIsLocked() external view returns (bool) {
        return lineupIsLocked;
    }

    // You need to call an index when getting a mapping. More convenient to have a getter so we can return whole lineup
    function getLineup(address _user) public view returns (uint256[] memory) {
        return userToLineup[_user];
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
    function getAdmin() public view returns (address) {
        return admin;
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
    // User joining the league
    function joinLeague() external onlyWhitelisted nonReentrant {
        require(!leagueEntryIsClosed, "League Entry is Closed!");
        require(!inLeague[msg.sender], "You have already joined this league");
        require(
            testUSDC.balanceOf(msg.sender) > stakeAmount,
            "Insufficent funds for staking"
        );

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
    }
}
