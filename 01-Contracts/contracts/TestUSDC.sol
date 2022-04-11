// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Test USDC for testing our contract -- rinkeby USDC doesn't have an ABI
contract TestUSDC is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("Test Rinkey USDC", "TUSDC") {
        // Minting our initial supply to the contract
        _mint(address(this), initialSupply);
    }

    // For testing -- transferring 10 to the sender
    function transferToSender() public onlyOwner {
        console.log("Allowance is ", allowance(address(this), msg.sender));
        transferFrom(address(this), msg.sender, 10);
    }

    function getContractBal() public view returns (uint256) {
        return balanceOf(address(this));
    }
}
