//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Storage contract for Athletes
// Will be updated with match data
contract Athletes is Ownable {
    // Our mapping of athletes (e.g. athlete # 4 => [1, 4, 2, 3] maps the first 4 weeks of scores)
    mapping(uint256 => uint256[]) public athleteToScores;
    Athlete[] public athletes;
    uint256 numAthletes;

    struct Athlete {
        uint256 id; // e.g. athlete #42
        uint256[] weeklyScores; // e.g. [0,2,1,3,5,...]
    }

    function appendStats(uint256 athleteId, uint256 weeklyScore)
        public
        onlyOwner
    {
        athleteToScores[athleteId].push(weeklyScore);
    }

    // Can't directly return a mapping, so returning an array of Athletes
    function getStats() public view returns (Athlete[] memory) {
        // To do: Return the mapping as array of Athletes
        // return athleteToScores;
        for (uint256 i = 0; i < athleteToScores.length; i++)
    }
}
