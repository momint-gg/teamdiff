// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./Athletes.sol";
import "./LeagueOfLegendsLogic.sol";

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

    // State isn't updating in LOL logic...
    // Moved to one eval matches function instead of splitting it up into two
    function evaluateMatches(
        uint256 currentWeekNum,
        Athletes athletesContract,
        mapping(address => uint256[]) storage userToRecord,
        mapping(address => uint256) storage userToTotalWins,
        mapping(address => uint256[]) storage userLineup,
        mapping(uint256 => LeagueOfLegendsLogic.Matchup[]) storage schedule
    ) public {
        for (uint256 i; i < schedule[currentWeekNum].length; i++) {
            // Addresses of the players who's match is being evaluated
            address addr1 = schedule[currentWeekNum][i].players[0];
            address addr2 = schedule[currentWeekNum][i].players[1];

            // Check to make sure matchup is not a bye week
            // If it is a bye week, assign 2 as result for this week
            if (addr1 == address(0)) {
                userToRecord[addr2].push(2);
            } else if (addr2 == address(0)) {
                userToRecord[addr1].push(2);
            }
            // If not a bye week
            else {
                console.log("evaluateMatches() called in MOBALogicLibrary");
                uint256 addr1Score;
                uint256 addr2Score;
                uint256[] memory lineup1 = userLineup[addr1];
                uint256[] memory lineup2 = userLineup[addr2];
                // Calculating users' total scores
                for (uint256 j; j < lineup1.length; j++) {
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
                // Updating mappings, no need to return the winner here
                console.log("Total points for addr1: ", addr1Score);
                console.log("Total points for addr2: ", addr2Score);

                if (addr1Score > addr2Score) {
                    console.log("Addr 1 wins!");
                    userToRecord[addr1].push(1);
                    userToRecord[addr2].push(0);
                    userToTotalWins[addr1] += 1; // If this doesn't update, proves we can't update state this way
                    emit MatchResult(addr1, addr2);
                } else {
                    console.log("Addr 2 wins!");
                    userToRecord[addr2].push(1);
                    userToRecord[addr1].push(0);
                    userToTotalWins[addr2] += 1;
                    emit MatchResult(addr2, addr1);
                }
            }
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
}
