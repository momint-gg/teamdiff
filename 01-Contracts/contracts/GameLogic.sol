// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

//import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
contract GameLogic is Initializable {
    //or (will we need ownership of this contract, o)
    // contract GameLogic is OwnableUpgradeable {
    uint256 public version;
    string public name;
    // uint256[6] public leagueMembers;
    // mapping(uint256 => uint256[2][]) public leagueSchedule;
    //event

    // function initialize(string calldata _name, uint256 _version) public initializer {
    //Delegate call fails when string is passed
    function initialize(uint256 _version) public initializer {
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        version = _version;
        name = "League Name";
        console.log("GameLogic initialized!");
    }

    function incrementVersion() external returns (uint256) {
        console.log("incrementing version:");
        version = version + 1;
        console.log(version);

        //        return 3;
    }

    // function setLeagueSchedule() external 
    // {
    //     console.log("setting schedule");
    //     mapping(uint256 => uint256[2][]) storage schedule;
    //     for(uint week = 0; week < 8; week++) {
    //         // schedule(i) = 
    //         for(uint i = 0; i < leagueMembers.length; i+=2) {
    //             uint256[2] memory matchup = [leagueMembers[i], leagueMembers[i+1]];
    //             schedule[week][0] = matchup;
    //         }
    //         //console.log("week " + week + ": " + schedule[week]);
    //     }
    //     //console.log()
    //     leagueSchedule = schedule;
    // }

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
