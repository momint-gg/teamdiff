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
import "./MOBALogicHelper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
    //TODO create a "MOBALogic" helper contract?
contract  LeagueOfLegendsLogic is Initializable, Ownable, AccessControl, Whitelist {
    // Vars
    uint256 public version; // tsting
    string public leagueName;
    uint256 public numWeeks; // Length of a split
    uint256 public currentWeekNum; // Keeping track of week number
    address[] public leagueMembers;
    //Note Admin will be the user, and our leaguemaker will be the owner, must grant access control
    address admin;
    //Maps each league member to the running count of their total wins
    //TODO, do we need this data structure?
    //mapping(address => uint256) userToTotalWins;
    //Maps each league member to an array that represents a win or loss for each week
    //TODO add logic for bye week?
        //bye = 2?
        //win = 1?
        //loss = 0
    mapping(address => uint256[8]) public userToRecord;
    //TODO how should we lock this lineUp?
    bool leagueEntryIsClosed;
    bool lineupIsLocked;
    //bool isPublic;
    //TODO can we set this to a fixed size line up array of size 5?
    mapping(address => uint256[]) userLineup;
    //uint256 private totalSupply;// Total supply of USDC
    uint256 public stakeAmount; // Amount that will be staked (in USDC) for each league
    
    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]
    
    /**********************/
    /* IMMUTABLE STORAGE  */
    /**********************/
    struct Stats {
        uint256 kills;
    }

    address public polygonUSDCAddress; // When we deploy to mainnet
    address public rinkebyUSDCAddress;
    // Our Athletes.sol contract
    Athletes athletesContract;
    // Our Whitelist contract
    Whitelist whitelistContract;
    // Our LeagueMaker contract
    LeagueMaker leagueMakerContract;
    //Our MOBALogicHElper contract
    //MOBALogicHelper mobaLogicHelper;

    //Events
    event Staked(address sender, uint256 amount);

    //Modifiers
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
        uint256 _version,
        //uint256 _numWeeks,
        uint256 _stakeAmount,
        bool _isPublic,
        address athletesDataStorageAddress,
        //address _owner,
        address _admin, 
        address _polygonUSDCAddress,
        address _rinkebyUSDCAddress,
        address leagueMakerContractAddress
        ) 
         
        public initializer {
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        version = _version;
        leagueName = _name;
        numWeeks = uint256(8);
        //currentWeekNum = uint256(0);
        //totalSupply = uint256(0);
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
        //mobaLogicHelper = new MOBALogicHelper();
        polygonUSDCAddress = _polygonUSDCAddress;
        rinkebyUSDCAddress = _rinkebyUSDCAddress;


        console.log("Proxy initialized!");
    }

    //event versionIncremented(uint256 newVersion);
    function incrementVersion() public  {
        version += 1;
    }

    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ***********/
    /*************************************************/
    //TODO set to only owner
    function setLeagueSchedule() 
        external 
        onlyOwner
    {
        console.log("setting schedule");
        uint256 randomShifter = ((uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        block.difficulty,
                        leagueName
                    )
                )
            ) + leagueMembers.length * leagueMembers.length));
            //console.log(randomShifter);
        //mapping(uint256 => uint256[2][]) storage schedule;
        //create two arrays of indices that represent indices in leagueMembers
        //essentially splitting the league into two halves, to assign matchups 
        uint256[4] memory leftHalf;
        uint256[4] memory rightHalf;
        for(uint week = 0; week < numWeeks; week++) {
            console.log("\n"); 
            console.log(week);
            console.log("************************");

            uint256 matchupSlots;
            //Create matchup slots that represents 2 * (number of matches each week), which includes byes
            (leagueMembers.length % 2 == 0) ? (
                matchupSlots = leagueMembers.length
            ) : (
                matchupSlots = (leagueMembers.length + 1)
            );

            //Grab temp value of rightHalf for final swap
            uint256 rightArrTemp = rightHalf[0];

            //fill values of array
            for(uint256 i = 0; i < matchupSlots / 2; i++) {
                //set elements of leftHalf and rightHalf to be indexes of users in leagueMembers
                if(week == 0) {
                    //init values in leftHalf and rightHalf with basic starting value
                    leftHalf[(i + randomShifter) % ((matchupSlots / 2))] = i;
                    rightHalf[(i + randomShifter) % ((matchupSlots / 2))] = i + matchupSlots / 2;
                }
                //otherwise rotate all elemnts clockwise between the two arrays
                //[0, 1, 2, 3] ==> [5, 6, 7, 8]
                //[4, 5, 6, 7] ==> [0, 1, 2, 3]
                else {
                    uint256 temp = leftHalf[i];
                    rightHalf[i] = temp;
                    leftHalf[i] = rightHalf[(i + 1) % ((matchupSlots / 2))];
                

                }
                //if(i != matchupSlots / 2 - 1 || week == 0) {
                // if(week == 0) {
                //     console.log("lefthalf end");
                //     console.log(leftHalf[(i + randomShifter) % ((matchupSlots / 2))]);
                //     console.log("righthalf end");
                //     console.log(rightHalf[(i + randomShifter) % ((matchupSlots / 2))]);
                //     console.log("\n");  

                // }
            }
            if(week != 0) {
                leftHalf[(matchupSlots / 2) - 1] = rightArrTemp;
                // console.log("lefthalf last");
                // console.log(leftHalf[(matchupSlots / 2) - 1]);
                // console.log("righthalf last");
                // console.log(rightHalf[(matchupSlots / 2) - 1]);
                // console.log("\n"); 
            }
            for(uint256 i = 0; i < matchupSlots / 2; i++) {
                //temporary array to hold single matchup
                address[2] memory matchupArray;
                //if matchupslots greater than number of leagueMembers
                    //just match the last player with bye week (zero address)
                if(rightHalf[i] >= leagueMembers.length) {
                    matchupArray = [leagueMembers[leftHalf[i]], address(0)];
                }
                else if(leftHalf[i] >= leagueMembers.length) {
                    matchupArray = [address(0), leagueMembers[rightHalf[i]]];
                }
                else {
                    matchupArray = [leagueMembers[leftHalf[i]], leagueMembers[rightHalf[i]]];
                }

                //Add matchup array to struct, to allow for nested structure
                Matchup memory matchup = Matchup({
                    players: matchupArray
                });                  

                //Add matchup to schedule for current week
                schedule[week].push(matchup);
                console.log(matchup.players[0]);
                console.log(" vs ");
                console.log(matchup.players[1]);
                console.log("\n");
            }

        }
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
    // function setAthleteContractAddress(address _athleteContractAddress)
    //     public
    //     onlyOwner
    // {
    //     athletesContract = Athletes(_athleteContractAddress);
    // }

    //Evalautes all matchups for a given week
    /*function evaluateWeek(uint256 currentWeekNum) 
        public
        onlyOwner
    {
        //call evaulte match for each match in this weeks schedule
        for(uint256 i = 0; i < schedule[currentWeekNum].length; i++) {
            // uint256[] memory lineup1 = userLineup[schedule[currentWeekNum][i].players[0]];
            // uint256[] memory lineup2 = userLineup[schedule[currentWeekNum][i].players[1]];
        
            //call evaulate match between members of Match
            address winner = mobaLogicHelper.evaluateMatch(
                schedule[currentWeekNum][i].players[0], 
                schedule[currentWeekNum][i].players[1], 
                currentWeekNum,
                userLineup[schedule[currentWeekNum][i].players[0]],
                userLineup[schedule[currentWeekNum][i].players[1]]
            );
            // if (addr1Score > addr2Score) {
            //     userToRecord[addr1][currentWeekNum] = 1;
            //     userToRecord[addr2][currentWeekNum] = 0;
            //     //userToTotalWins[addr1] += 1;
            //     return addr1;
            // } else {
            //     userToRecord[addr2][currentWeekNum] = 1;
            //     userToRecord[addr1][currentWeekNum] = 0;
            //     //userToTotalWins[addr2] += 1;
            //     return addr2;
            // }
        }
    }
    */
    // Evaluating a match between two users (addresses)
    // Returns which user won
    // TODO: Event emitted for each user matchup
    /*function evaluateMatch(address addr1, address addr2, uint256 currentWeekNum)
         
        public
        onlyOwner
        returns (address)
    {
        uint256[] memory lineup1 = userLineup[addr1];
        uint256[] memory lineup2 = userLineup[addr2];
        uint256 addr1Score;
        uint256 addr2Score;

        // Calculating users' total scores
        for (uint256 i = 0; i < lineup1.length; i++) {
            // Calling the Athletes.sol contract to get the scores of ith athlete
            uint256[] memory currAthleteScores1 = athletesContract
                                                .getAthleteScores(lineup1[i]);
            uint256[] memory currAthleteScores2 = athletesContract
                                                .getAthleteScores(lineup2[i]);
            // Getting the last score in the array
            uint256 latestScore1 = currAthleteScores1[
                currAthleteScores1.length - 1
            ];
            uint256 latestScore2 = currAthleteScores2[
                currAthleteScores2.length - 1
            ];
            // Calculating scores for users
            if (latestScore1 > latestScore2) {
                addr1Score += 1;
            } else {
                addr2Score += 1;
            }
        }
        // Incrementing week #
        //currentWeekNum += 1;
        // Updating mappings and returning the winner
        if (addr1Score > addr2Score) {
            userToRecord[addr1][currentWeekNum] = 1;
            userToRecord[addr2][currentWeekNum] = 0;
            //userToTotalWins[addr1] += 1;
            return addr1;
        } else {
            userToRecord[addr2][currentWeekNum] = 1;
            userToRecord[addr1][currentWeekNum] = 0;
            //userToTotalWins[addr2] += 1;
            return addr2;
        }
    }    */

    /************************************************/
    /***************** GETTERS **********************/
    /************************************************/
    function getVersion() view public returns (uint256 version) {
        return version;
    }

    function getLeagueName() view public returns (string memory) {
        return leagueName;
    }

    function getStakeAmount() view public returns (uint256 stakeAmount) {
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



        // Getter for user to total pts
    function getUserTotalWins()   public view returns (uint256) {
        //return userToTotalWins[msg.sender];
        uint256 winSum = 0;
        uint256 currentWeekNum = leagueMakerContract.currentWeek();
        for(uint256 i = 0; i <= currentWeekNum; i++) {
            winSum += userToRecord[msg.sender][i];
        }
        return winSum;
    }

    // Getter for user to weekly pts
    function getUserRecord()   public view returns (uint256[8] memory) {
        return userToRecord[msg.sender];
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
    //for testing
    // function addUserToLeague(address user) public {
    //     require(!leagueEntryIsClosed, "League Entry is Closed!");
    //     if(leagueMembers.length < 8) {
    //         leagueMembers.push(user);
    //         leagueMakerContract.updateUserToLeagueMapping(user);
    //     }
    //     else {
    //         console.log("too many users in league to add new user");
    //     }
    // }

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
