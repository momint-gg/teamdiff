// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";

// Test USDC for testing our contract -- rinkeby USDC doesn't have an ABI
contract TestUSDC is ERC20 {
    constructor(uint256 initialSupply) ERC20("Test Rinkey USDC", "TUSDC") {
        // Minting our initial supply to the owner
        _mint(msg.sender, initialSupply);
    }
}
