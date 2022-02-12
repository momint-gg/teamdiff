// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
//import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
contract GameLogic is Initializable {
//or (will we need ownership of this contract, o)
// contract GameLogic is OwnableUpgradeable {


    //I should list the expected proxy data package 
    //event 

    function initialize() public initializer {
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        // version = 1;
        // secretNumber = _secretNumber;
        //incrementVersion();
        console.log("GameLogic initialized!");
    }

    // function decrement(uint256 x) public returns 
     
     
    function incrementVersion(uint256 version) public returns (uint256) {
        return version + 1;
    }

    // fallback() override payable external {
    //     //_fallback();
    //     //_delegate();
    //     console.log("fallback");
    // }
}