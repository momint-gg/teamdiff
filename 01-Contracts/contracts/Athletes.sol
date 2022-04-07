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
    mapping(uint256 => uint256[]) public athleteToScores;
    Athlete[] public athletes;
    uint256 numAthletes;

    struct Athlete {
        uint256 athleteID; // e.g. athlete #42
        uint256[] weeklyScores; // e.g. [0,2,1,3,5,...]
    }

    function appendStats(uint256 athleteId, uint256 weeklyScore)
        public
        onlyOwner
    {
        if (athleteToScores[athleteId].length == 0) {
            numAthletes++;
        }
        athleteToScores[athleteId].push(weeklyScore);
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

    // Function for the other contract to call, getting a specific athlete's scores
    function getAthleteScores(uint256 index)
        public
        view
        returns (uint256[] memory)
    {
        return athleteToScores[index];
    }

    //TODO calculate score for an athlete entirely on-chain
    function calculateScoreOnChain(uint256 athleteID) 
        public
        returns(uint256)
    {
        //grab raw stats for this athleteID, and return their calculated score here.
    }
}
