//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Storage contract for Athletes
// Will be updated with match data
contract Athletes is Ownable {
    using SafeMath for uint256;
    // Our mapping of athletes (e.g. athlete # 4 => [1, 4, 2, 3] maps the first 4 weeks of scores)
    mapping(uint256 => uint256[8]) public athleteToScores;
    Athlete[] public athletes;
    uint256 numAthletes;

    struct Athlete {
        uint256 athleteID; // e.g. athlete #42
        uint256[8] weeklyScores; // e.g. [0,2,1,3,5,...]
    }

    struct Stats {
        uint256 kills;
    }

    function appendStats(
        uint256 athleteId,
        uint256 weeklyScore,
        uint256 weekNum
    ) public onlyOwner {
        if (athleteToScores[athleteId].length == 0) {
            numAthletes++;
        }
        athleteToScores[athleteId][weekNum] = weeklyScore;
    }

    // Can't directly return a mapping, so returning an array of Athletes
    function getStats() public returns (Athlete[] memory) {
        delete athletes; // Clearing arr first

        for (uint256 i = 0; i < numAthletes; i++) {
            Athlete memory currAthlete = Athlete(i, athleteToScores[i]); // Order doesn't matter
            athletes.push(currAthlete);
        }

        return athletes;
    }

    // For testing mainly
    function getAthletes() public view returns (Athlete[] memory) {
        return athletes;
    }

    // Function for the other contract to call, getting a specific athlete's scores (changed to single score returned)
    function getSpecificAthleteScore(uint256 index, uint256 week)
        public
        view
        returns (uint256)
    {
        return athleteToScores[index][week];
    }

    function getAthleteScores(uint256 index)
        public
        view
        returns (uint256[8] memory)
    {
        return athleteToScores[index];
    }

    // Getting the total # of athletes - should be 50 when we deploy
    function getNumAthletes() external view returns (uint256) {
        return athletes.length;
    }

    // TODO: Finish this
    // TODO calculate score for an athlete entirely on-chain
    // Allows verification of our off-chain calculations
    function calculateScoreOnChain(Stats calldata athleteStats)
        public
        pure
        returns (uint256 score)
    {
        //calculate score with given stats
        //placeholder lol
        return athleteStats.kills * 2;
    }
}
