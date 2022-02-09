// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
//import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
contract GameLogic is OwnableUpgradeable {

    uint256 public version;
    uint256 public secretNumber;
    //I should list the expected proxy data package

    function initialize(uint _secretNumber) public initializer {
        version = 1;
        secretNumber = _secretNumber;
        incrementVersion();
    }

    // function decrement(uint256 x) public returns (uint256) {
    //     return dec = x.sub(1);
    // }
    function incrementVersion() public returns (uint256) {
        return version = version + 1;
    }
}