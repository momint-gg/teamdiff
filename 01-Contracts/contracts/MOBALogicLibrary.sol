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
        require(
            leagueMembers.length > 0,
            "You don't have enough members in this league to set a schedule."
        );
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
            uint256 leftArrTemp = leftHalf[0];

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
                //first sort complete, now swap first indices
                rightHalf[0] = leftHalf[0];
                leftHalf[0] = leftArrTemp;

                // leftHalf[(matchupSlots / 2) - 1] = rightArrTemp;
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
                // console.log(leftHalf[i]);
                console.log(matchup.players[0]);
                console.log(" vs ");
                // console.log(rightHalf[i]);
                console.log(matchup.players[1]);
                console.log("\n");
            }
        }
    }

    // TODO: Delete all of the console logs
    // NOTE: Current week num must start with 0
    // function evaluateMatches(
    //     uint256 currentWeekNum,
    //     Athletes athletesContract,
    //     mapping(address => uint256[8]) storage userToRecord,
    //     mapping(address => uint256[5]) storage userLineup,
    //     mapping(address => uint256) storage userToPoints,
    //     mapping(address => uint256[8]) storage userToWeekScore,
    //     mapping(uint256 => LeagueOfLegendsLogic.Matchup[]) storage schedule
    // ) public {
    //     for (uint256 i; i < schedule[currentWeekNum].length; i++) {
    //         // Addresses of the players who's match is being evaluated
    //         address addr1 = schedule[currentWeekNum][i].players[0];
    //         address addr2 = schedule[currentWeekNum][i].players[1];

    //         // Check to make sure matchup is not a bye week
    //         // If it is a bye week, assign 3 as result for this week
    //         if (addr1 == address(0)) {
    //             userToRecord[addr2][currentWeekNum] = 3;
    //         } else if (addr2 == address(0)) {
    //             userToRecord[addr1][currentWeekNum] = 3;
    //         }
    //         // If not a bye week
    //         else {
    //             uint256 addr1Score;
    //             uint256 addr2Score;
    //             uint256[5] memory lineup1 = userLineup[addr1];
    //             uint256[5] memory lineup2 = userLineup[addr2];

    //             // Calculating users' total scores for their lineups
    //             for (uint256 j; j < lineup1.length; j++) {
    //                 // Calling the Athletes.sol contract to get the scores of ith athlete and current week
    //                 uint256 latestScore1 = athletesContract
    //                     .getSpecificAthleteScore(lineup1[j], currentWeekNum);
    //                 uint256 latestScore2 = athletesContract
    //                     .getSpecificAthleteScore(lineup2[j], currentWeekNum);

    //                 // Calculating scores for users
    //                 if (latestScore1 > latestScore2) {
    //                     addr1Score += 1;
    //                 } else if (latestScore2 > latestScore1) {
    //                     addr2Score += 1;
    //                 }
    //             }

    //             // Updating mappings
    //             // TODO: Add updating state for user to week score mapping?
    //             if (addr1Score > addr2Score) {
    //                 userToRecord[addr1][currentWeekNum] = 1;
    //                 userToRecord[addr2][currentWeekNum] = 0;
    //                 userToPoints[addr1] += 2;
    //                 emit MatchResult(addr1, addr2);
    //             } else if (addr2Score > addr1Score) {
    //                 userToRecord[addr2][currentWeekNum] = 1;
    //                 userToRecord[addr1][currentWeekNum] = 0;
    //                 userToPoints[addr2] += 2;
    //                 emit MatchResult(addr2, addr1);
    //             } else {
    //                 // In the case of a tie
    //                 userToRecord[addr2][currentWeekNum] = 2;
    //                 userToRecord[addr1][currentWeekNum] = 2;
    //                 userToPoints[addr1] += 1;
    //                 userToPoints[addr2] += 1;
    //                 emit MatchResult(addr2, addr1);
    //             }
    //         }
    //     }
    // }

    // Moved to outside evaluate match function bc stack too deep
    // First uint returned is lineup1, second uint returned is lineup2
    function getSpecificAthleteScore(
        uint256 index1,
        uint256 index2,
        Athletes athletesContract,
        uint256 weekNum
    ) internal returns (uint256, uint256) {
        return (0, 0);
    }

    // State isn't updating in LOL logic...
    // Moved to one eval matches function instead of splitting it up into two
    // Important Note: 0 = loss, 1 = win, 2 = tie, 3 = bye
    // function evaluateMatches(
    //     uint256 currentWeekNum,
    //     Athletes athletesContract,
    //     mapping(address => uint256[]) storage userToRecord,
    //     mapping(address => uint256[]) storage userLineup,
    //     mapping(address => uint256) storage userToPoints,
    //     mapping(uint256 => LeagueOfLegendsLogic.Matchup[]) storage schedule
    // ) public {
    //     for (uint256 i; i < schedule[currentWeekNum].length; i++) {
    //         // Addresses of the players who's match is being evaluated
    //         address addr1 = schedule[currentWeekNum][i].players[0];
    //         address addr2 = schedule[currentWeekNum][i].players[1];

    //         // Check to make sure matchup is not a bye week
    //         // If it is a bye week, assign 2 as result for this week
    //         if (addr1 == address(0)) {
    //             userToRecord[addr2].push(3);
    //         } else if (addr2 == address(0)) {
    //             userToRecord[addr1].push(3);
    //         }
    //         // If not a bye week
    //         else {
    //             console.log("evaluateMatches() called in MOBALogicLibrary");
    //             uint256 addr1Score;
    //             uint256 addr2Score;
    //             uint256[] memory lineup1 = userLineup[addr1];
    //             uint256[] memory lineup2 = userLineup[addr2];
    //             // Calculating users' total scores
    //             for (uint256 j; j < lineup1.length; j++) {
    //                 // Calling the Athletes.sol contract to get the scores of ith athlete
    //                 uint256[] memory currAthleteScores1 = athletesContract
    //                     .getAthleteScores(lineup1[j]);
    //                 uint256[] memory currAthleteScores2 = athletesContract
    //                     .getAthleteScores(lineup2[j]);
    //                 // Getting the last score in the array
    //                 uint256 latestScore1 = currAthleteScores1[
    //                     currAthleteScores1.length - 1
    //                 ];
    //                 uint256 latestScore2 = currAthleteScores2[
    //                     currAthleteScores2.length - 1
    //                 ];
    //                 // Calculating scores for users
    //                 if (latestScore1 > latestScore2) {
    //                     addr1Score += 1;
    //                 } else if (latestScore2 > latestScore1) {
    //                     addr2Score += 1;
    //                 }
    //             }
    //             // Updating mappings
    //             // uint256 addr1Points = userToPoints[addr1];
    //             // uint256 addr2Points = userToPoints[addr2];

    //             if (addr1Score > addr2Score) {
    //                 userToRecord[addr1].push(1);
    //                 userToRecord[addr2].push(0);
    //                 userToPoints[addr1] += 2;
    //                 emit MatchResult(addr1, addr2);
    //             } else if (addr2Score > addr1Score) {
    //                 userToRecord[addr2].push(1);
    //                 userToRecord[addr1].push(0);
    //                 userToPoints[addr2] += 2;
    //                 emit MatchResult(addr2, addr1);
    //             } else {
    //                 // In the case of a tie
    //                 userToRecord[addr2].push(2);
    //                 userToRecord[addr1].push(2);
    //                 userToPoints[addr1] += 1;
    //                 userToPoints[addr2] += 1;
    //                 emit MatchResult(addr2, addr1);
    //             }
    //         }
    //     }
    // }

    // Calculating league winner(s)
    function calculateLeagueWinners(
        address[] memory leagueMembers,
        mapping(address => uint256) storage userToPoints,
        address[] storage winnersStateArr
    ) external {
        uint256 maxPoints; // Max points so far
        bool[8] memory isWinner; // Seeing if someone is a winner or not, max league size is 8

        for (uint256 i; i < leagueMembers.length; i++) {
            // New winner -- clear array and add new winner
            if (userToPoints[leagueMembers[i]] > maxPoints) {
                // Updating max points
                maxPoints = userToPoints[leagueMembers[i]];
                // Setting everything except the winner to false
                for (uint256 j; j < i; j++) {
                    isWinner[j] = false;
                }
                isWinner[i] = true;
                for (uint256 j = i + 1; j < leagueMembers.length; j++) {
                    isWinner[j] = false;
                }
            }
            // Tie -- set winner to true
            if (userToPoints[leagueMembers[i]] == maxPoints) {
                isWinner[i] = true;
            }
        }

        // Creating our winners array
        uint256 count;
        for (uint256 i; i < isWinner.length; i++) {
            if (isWinner[i]) {
                winnersStateArr.push(leagueMembers[i]);
                count++;
            }
        }
    }

    // Making sure a lineup is valid -- moving setLineup requires to external function (TODO)
    function checkValidLineup() external returns (bool) {}

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
