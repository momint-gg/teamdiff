// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./Athletes.sol";
import "./LeagueOfLegendsLogic.sol";

// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
//TODO create a "LeagueLogic" interface?
library MOBALogicLibrary {
    event MatchResult(address winner, address loser);

    /*************************************************/
    /************ TEAM DIFF ONLY FUNCTIONS ***********/
    /*************************************************/
    function setLeagueSchedule(
        mapping(uint256 => LeagueOfLegendsLogic.Matchup[]) storage schedule,
        address[] storage leagueMembers,
        uint256 numWeeks,
        string calldata leagueName
    ) public {
        console.log("setting schedule in library");
        uint256 randomShifter = (
            (uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        block.difficulty,
                        leagueName
                    )
                )
            ) + leagueMembers.length * leagueMembers.length)
        );
        //console.log(randomShifter);
        //mapping(uint256 => uint256[2][]) storage schedule;
        //create two arrays of indices that represent indices in leagueMembers
        //essentially splitting the league into two halves, to assign matchups
        uint256[4] memory leftHalf;
        uint256[4] memory rightHalf;
        for (uint256 week = 0; week < numWeeks; week++) {
            console.log("\n");
            console.log(week);
            console.log("************************");
            uint256 matchupSlots;
            //Create matchup slots that represents 2 * (number of matches each week), which includes byes
            (leagueMembers.length % 2 == 0)
                ? (matchupSlots = leagueMembers.length)
                : (matchupSlots = (leagueMembers.length + 1));

            //Grab temp value of rightHalf for final swap
            uint256 rightArrTemp = rightHalf[0];

            //fill values of array
            for (uint256 i = 0; i < matchupSlots / 2; i++) {
                //set elements of leftHalf and rightHalf to be indexes of users in leagueMembers
                if (week == 0) {
                    //init values in leftHalf and rightHalf with basic starting value
                    leftHalf[(i + randomShifter) % ((matchupSlots / 2))] = i;
                    rightHalf[(i + randomShifter) % ((matchupSlots / 2))] =
                        i +
                        matchupSlots /
                        2;
                }
                //otherwise rotate all elemnts clockwise between the two arrays
                //[0, 1, 2, 3] ==> [5, 6, 7, 8]
                //[4, 5, 6, 7] ==> [0, 1, 2, 3]
                else {
                    uint256 temp = leftHalf[i];
                    rightHalf[i] = temp;
                    leftHalf[i] = rightHalf[(i + 1) % ((matchupSlots / 2))];
                }
            }
            if (week != 0) {
                leftHalf[(matchupSlots / 2) - 1] = rightArrTemp;
            }
            for (uint256 i = 0; i < matchupSlots / 2; i++) {
                //temporary array to hold single matchup
                address[2] memory matchupArray;
                //if matchupslots greater than number of leagueMembers
                //just match the last player with bye week (zero address)
                if (rightHalf[i] >= leagueMembers.length) {
                    matchupArray = [leagueMembers[leftHalf[i]], address(0)];
                } else if (leftHalf[i] >= leagueMembers.length) {
                    matchupArray = [address(0), leagueMembers[rightHalf[i]]];
                } else {
                    matchupArray = [
                        leagueMembers[leftHalf[i]],
                        leagueMembers[rightHalf[i]]
                    ];
                }

                //Add matchup array to struct, to allow for nested structure
                LeagueOfLegendsLogic.Matchup
                    memory matchup = LeagueOfLegendsLogic.Matchup({
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

    //TODO emit event
    function evaluateMatch(
        address addr1,
        address addr2,
        uint256 currentWeekNum,
        Athletes athletesContract,
        uint256[] memory lineup1,
        uint256[] memory lineup2,
        mapping(address => uint256[8]) storage userToRecord,
        mapping(address => uint256) storage userToTotalWins
    ) public returns (address) {
        //Check to make sure matchup is not a bye week
        //If it is a bye week, assign 2 as result for this week
        if (addr1 == address(0)) {
            userToRecord[addr2][currentWeekNum] = 2;
            return addr2;
        } else if (addr2 == address(0)) {
            userToRecord[addr1][currentWeekNum] = 2;
            return addr1;
        } else {
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
            // Updating mappings and returning the winner
            if (addr1Score > addr2Score) {
                userToRecord[addr1][currentWeekNum] = 1;
                userToRecord[addr2][currentWeekNum] = 0;
                userToTotalWins[addr1] += 1;
                emit MatchResult(addr1, addr2);

                return addr1;
            } else {
                userToRecord[addr2][currentWeekNum] = 1;
                userToRecord[addr1][currentWeekNum] = 0;
                userToTotalWins[addr2] += 1;
                emit MatchResult(addr2, addr1);

                return addr2;
            }
        }
    }

    //Evalautes all matchups for a given week
    function evaluateWeek(
        mapping(uint256 => LeagueOfLegendsLogic.Matchup[]) storage schedule,
        uint256 currentWeekNum,
        Athletes athletesContract,
        mapping(address => uint256[8]) storage userToRecord,
        mapping(address => uint256) storage userToTotalWins,
        mapping(address => uint256[]) storage userLineup
    ) public {
        console.log("IN THE MOBA LOGIC LIBRARY EVAL WEEK FUNCTION");
        //call evaulte match for each match in this weeks schedule
        for (uint256 i = 0; i < schedule[currentWeekNum].length; i++) {
            //call evaulate match between members of Match
            address competitor1 = schedule[currentWeekNum][i].players[0];
            address competitor2 = schedule[currentWeekNum][i].players[1];
            evaluateMatch(
                schedule[currentWeekNum][i].players[0],
                schedule[currentWeekNum][i].players[1],
                currentWeekNum,
                athletesContract,
                userLineup[competitor1],
                userLineup[competitor2],
                userToRecord,
                userToTotalWins
            );
        }
    }

    function calculateScoreOnChain(
        LeagueOfLegendsLogic.Stats calldata athleteStats
    ) public pure returns (uint256) {
        //calculate score with given stats
        uint256 score = 0;
        score += 2 * athleteStats.kills * 100;
        score -= athleteStats.deaths * 100;
        score += athleteStats.assists * 100;
        score += (athleteStats.minionScore * 100) / 50;
        if (athleteStats.kills >= 10) {
            score += 500;
        }
        if (athleteStats.assists >= 10) {
            score += 500;
        }
        //returns the score * 100, can scale down on frontend to enable floats
        return score;
    }

    // Seeing if there is a duplicate or not
    function checkDuplicate(uint256[] memory arr) public pure returns (bool) {
        for (uint256 i; i < arr.length; i++) {
            arr[arr[i] % arr.length] = arr[arr[i] % arr.length] + arr.length;
        }
        for (uint256 i; i < arr.length; i++) {
            if (arr[i] >= arr.length * 2) {
                return false; // Duplicate
            }
        }
        return true; // No duplicate
    }
}
