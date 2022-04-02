// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
//import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Athletes.sol";
//import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
contract GameLogic is Initializable {
    // Vars
    //TODO initialize all these in the initialize constructor
    uint256 version; // Length of a split
    uint256 numWeeks; // Length of a split
    uint256 leagueSize; // For testing
    uint256 currentWeekNum; // Keeping track of week number
    address[] leagueMembers;
    address[] whitelist;
    string leagueName;
    mapping(address => uint256) userToTotalPts;
    mapping(address => uint256[]) userToWeeklyPts;
    mapping(address => uint256[]) userLineup;

    // Our Athletes.sol contract
    Athletes athletesContract;

    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[8]) schedule; // Schedule for the league (generated before), maps week # => [matchups]


    // function initialize(string calldata _name, uint256 _version) public initializer {
    //Delegate call fails when string is passed
    function initialize(
        uint256 _version,
        uint256 _numWeeks,
        // uint256 _currentWeekNum
        address athletesDataStorage
        //uint256 _leagueSize
        ) public initializer {
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        version = _version;
        numWeeks = _numWeeks;
        currentWeekNum = uint256(0);
        leagueName = "League Name";
        athletesContract = Athletes(athletesDataStorage);
        leagueMembers.push(msg.sender);
        console.log("Proxy initialized!");
    }

    function incrementVersion() external returns (uint256) {
        console.log("incrementing version:");
        version = version + 1;
        console.log(version);
    }

    function setLeagueSchedule() external 
    {
        console.log("setting schedule");
        //mapping(uint256 => uint256[2][]) storage schedule;
        //create two arrays of indices that represent indices in leagueMembers
        //essentially splitting the league into two halves, to assign matchups 
        uint256[4] memory leftHalf;
        uint256[4] memory rightHalf;
        for(uint week = 0; week < 8; week++) {
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
                // console.log("i: ");
                // console.log(i);
                // console.log("leftHalf start ");

                // console.log(leftHalf[i]);
                // console.log("righthalf start");
                // console.log(rightHalf[i]);
                // console.log("\n");  
                if(week == 0) {
                    //init values in leftHalf and rightHalf with basic starting value
                    //TODO introduce randomness here with an offset value
                    leftHalf[i] = i;
                    rightHalf[i] = i + matchupSlots / 2;
                }
                //otherwise rotate all elemnts clockwise between the two arrays
                //[0, 1, 2, 3] ==> [5, 6, 7, 8]
                //[4, 5, 6, 7] ==> [0, 1, 2, 3]
                else {
                    uint256 temp = leftHalf[i];
                    rightHalf[i] = temp;
                    leftHalf[i] = rightHalf[(i + 1) % ((matchupSlots / 2))];
                

                }
                // if(i != matchupSlots / 2 - 1 || week == 0) {
                //     console.log("lefthalf end");
                //     console.log(leftHalf[i]);
                //     console.log("righthalf end");
                //     console.log(rightHalf[i]);
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
                schedule[week][i] = matchup;
                console.log(matchup.players[0]);
                console.log(" vs ");
                console.log(matchup.players[1]);
                console.log("\n");
            }

        }
    }

    // Setting the lineup for a user
    function setLineup(uint256[] memory athleteIds) public {
        userLineup[msg.sender] = athleteIds;
    }


    // Returning the lineup for a user
    function getLineup() public view returns (uint256[] memory) {
        return userLineup[msg.sender];
    }

    // Add user to league
    function addUserToLeague(address user) public {
        //for testing
        leagueMembers.push(user);
        //for prod
        // leagueMembers.push(msg.sender);
    }

    // Add user to whitelist
    function addUserToWhitelist() public {
        whitelist.push(msg.sender);
    }

    // Setting the address for our athlete contract
    function setAthleteContractAddress(address _athleteContractAddress)
        public
        onlyOwner
    {
        athletesContract = Athletes(_athleteContractAddress);
    }

    // Evaluating a match between two users (addresses)
    // Returns which user won
    function evaluateMatch(address addr1, address addr2)
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
        currentWeekNum += 1;
        // Updating mappings and returning the winner
        if (addr1Score > addr2Score) {
            userToWeeklyPts[addr1].push(1);
            userToWeeklyPts[addr2].push(0);
            userToTotalPts[addr1] += 1;
            return addr1;
        } else {
            userToWeeklyPts[addr2].push(1);
            userToWeeklyPts[addr1].push(0);
            userToTotalPts[addr2] += 1;
            return addr2;
        }
    }    

    /**
     * @dev Fallback function.
     * Implemented entirely in `_fallback`.
    //  */
    // fallback() external payable {
    //     //_fallback();
    //     //_delegate();
    //     console.log("fallback in the logic");
    // }
}
