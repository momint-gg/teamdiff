//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract League is Ownable {
    // State (proxy) vars:
    mapping(address => uint256) userToTotalPts;
    mapping(address => uint256[]) userToWeeklyPts;

    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]
}
