//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Athletes.sol";

contract League is Ownable, Athletes {
    // Vars
    uint256 numWeeks = 8; // Length of a split
    uint256 leagueSize = 8; // For testing
    uint256 currentWeekNum; // Keeping track of week number

    mapping(address => uint256) userToTotalPts;
    mapping(address => uint256[]) userToWeeklyPts;
    mapping(address => uint256[]) userLineup;

    // Our Athletes.sol contract
    Athletes athletesContract;

    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]

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

    // Setting the lineup for a user
    function setLineup(uint256[] memory athleteIds) public {
        userLineup[msg.sender] = athleteIds;
    }

    // Returning the lineup for a user
    function getLineup() public view returns (uint256[] memory) {
        return userLineup[msg.sender];
    }

    // Sets the initial schedule for the league -- this will be done off chain
    // Will figure out exact way to pass in params later once Isaiah is done
    function setLeagueSchedule() public onlyOwner {}

    // Setting the address for our athlete contract
    function setAthleteContractAddress(address _athleteContractAddress)
        public
        onlyOwner
    {
        athletesContract = Athletes(_athleteContractAddress);
    }

    // Getter for user to total pts
    function getUserTotalPts() public view returns (uint256) {
        return userToTotalPts[msg.sender];
    }

    // Getter for user to weekly pts
    function getUserWeeklypts() public view returns (uint256[] memory) {
        return userToWeeklyPts[msg.sender];
    }


    //TODO
    //1.) View function to calculate score on-chain for a given line-up and week
    //2.) Pool Prize mechanics
    //3.) League membership mechanics
    //4.) League schedule creation mechanics
    //5.) lock set line-up with onlyOwner function
}
