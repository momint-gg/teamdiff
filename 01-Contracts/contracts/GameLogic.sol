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
    uint256 public version;
    string public name;

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
        console.log("incrementing version:\n");
        console.log(version);
        version = version + 1;
        //        return 3;
    }

    /**
     * @dev Fallback function.
     * Implemented entirely in `_fallback`.
     */
    fallback() external payable {
        //_fallback();
        //_delegate();
        console.log("fallback in the logic");
    }
}
