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
import "./LeagueOfLegendsLogic.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
    //TODO create a "LeagueLogic" interface?
library MOBALogicLibrary {
    // Vars
    // uint256 public version; // tsting
    // string public leagueName;
    // uint256 public numWeeks; // Length of a Season
    // //uint256 public currentWeekNum; // Keeping track of week number
    // address[] public leagueMembers;
    //address[] whitelist;
    //Note Admin will be the user, and our leaguemaker will be the owner, must grant access control
    //address owner;
    // address admin;
    //Maps each league member to the running count of their total wins
    //TODO, do we need this data structure?
    //mapping(address => uint256) userToTotalWins;
    //Maps each league member to an array that represents a win or loss for each week
    //TODO add logic for bye week?
        //bye = 2?
        //win = 1?
        //loss = 0
    //mapping(address => uint256[8]) public userToRecord;
    //TODO how should we lock this lineUp?
    // bool leagueEntryIsClosed;
    // bool lineupIsLocked;
    // //bool isPublic;
    // //TODO can we set this to a fixed size line up array of size 5?
    // //mapping(address => uint256[]) userLineup;
    // //uint256 private totalSupply;// Total supply of USDC
    // uint256 public stakeAmount; // Amount that will be staked (in USDC) for each league
    
    // struct Matchup {
    //     address[2] players;
    // }
    // mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]
    
    // /**********************/
    // /* IMMUTABLE STORAGE  */
    // /**********************/
    // // struct Stats {
    // //     uint256 kills;
    // // }

    // address public polygonUSDCAddress; // When we deploy to mainnet
    // address public rinkebyUSDCAddress;
    // // Our Athletes.sol contract
    // //Athletes athletesContract;
    // // Our Whitelist contract
    // Whitelist whitelistContract;
    // // Our LeagueMaker contract
    // //LeagueMaker leagueMakerContract;


    // //Events
    // event Staked(address sender, uint256 amount);

    // //Modifiers
    // using SafeMath for uint256;

    // /**
    //  * @dev Throws if called by any account that's not Admin
    //  * The creator of the league will be set to Admin, and have admin privileges
    //  */
    // modifier onlyAdmin() {
    //     // In our case, whitelisted can also mean nobody has been added to the whitelist and nobody besides the league creator
    //     require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender));
    //     _;
    // }


    // //@dev must be implemented
    // //Initialize all parameters of proxy
    // function initialize(
    //     string calldata _name,
    //     uint256 _version,
    //     //uint256 _numWeeks,
    //     uint256 _stakeAmount,
    //     bool _isPublic,
    //     address athletesDataStorageAddress,
    //     //address _owner,
    //     address _admin, 
    //     address _polygonUSDCAddress,
    //     address _rinkebyUSDCAddress,
    //     address leagueMakerContractAddress
    //     ) 
    //     virtual
    //     public; 
    //     //initializer;
    // //     //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
    // //     version = _version;
    // //     leagueName = _name;
    // //     //numWeeks = _numWeeks;
    // //     //currentWeekNum = uint256(0);
    // //     //totalSupply = uint256(0);
    // //     stakeAmount = _stakeAmount;
    // //     isPublic = _isPublic;
    // //     lineupIsLocked = false;
    // //     leagueEntryIsClosed = false;
    // //     //stake(rinkebyUSDCAddress, stakeAmount);
    // //     athletesContract = Athletes(athletesDataStorageAddress);
    // //     leagueMakerContract = LeagueMaker(leagueMakerContractAddress);
    // //     //owner = _owner;
    // //     //admin = _admin;
    // //     _setupRole(DEFAULT_ADMIN_ROLE, _admin);
    // //     polygonUSDCAddress = _polygonUSDCAddress;
    // //     rinkebyUSDCAddress = _rinkebyUSDCAddress;

    // //     leagueMembers.push(_admin);
    // //     whitelistContract = new Whitelist(); // Initializing our whitelist

    // //     console.log("Proxy initialized!");
    // // }

    // //event versionIncremented(uint256 newVersion);
    // function incrementVersion() public  {
    //     version += 1;
    // }

    // struct Matchup {
    //     address[2] players;
    // }

    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ***********/
    /*************************************************/
    //TODO set to only owner
    function setLeagueSchedule(
        mapping(uint256 => LeagueOfLegendsLogic.Matchup[]) storage schedule,
        address[] storage leagueMembers,
        uint256 numWeeks,
        string calldata leagueName
    ) 
        public 
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
                LeagueOfLegendsLogic.Matchup memory matchup = LeagueOfLegendsLogic.Matchup({
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
    //self

}