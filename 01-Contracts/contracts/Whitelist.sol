//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// The implementation of this contract for us will be for VRFv2Consumer
// Allowing multiple contracts to call the random function (changed from onlyOwner to onlyWhitelisted)

/*
 * @title Whitelist
 * @dev The Whitelist contract has a whitelist of addresses, and provides basic authorization control functions.
 * @dev This simplifies the implementation of "user permissions".
 */
contract Whitelist is Ownable {
    mapping(address => bool) public whitelist;
    address leagueCreator;
    uint256 numWhitelisted; // Keeping track of the number of users whitelisted (slight modification to code)

    event WhitelistedAddressAdded(address addr);
    event WhitelistedAddressRemoved(address addr);

    constructor(address _creator) {
        leagueCreator = _creator;
    }

    /**
     * @dev Throws if called by any account that's not whitelisted.
     */
    modifier onlyWhitelisted() {
        // In our case, whitelisted can also mean nobody has been added to the whitelist and nobody besides the league creator
        require(whitelist[msg.sender] || numWhitelisted == 0);
        _;
    }

    // Checking to see if this is the league creator
    modifier onlyCreator() {
        require(msg.sender == leagueCreator);
        _;
    }

    /*
     * @dev add an address to the whitelist
     * @param addr address
     * @return true if the address was added to the whitelist, false if the address was already in the whitelist
     */
    function addAddressToWhitelist(address addr)
        public
        onlyCreator
        returns (bool success)
    {
        if (!whitelist[addr]) {
            whitelist[addr] = true;
            emit WhitelistedAddressAdded(addr);
            numWhitelisted += 1;
            success = true;
        }
    }

    /*
     * @dev add addresses to the whitelist
     * @param addrs addresses
     * @return true if at least one address was added to the whitelist,
     * false if all addresses were already in the whitelist
     */
    function addAddressesToWhitelist(address[] memory addrs)
        public
        onlyCreator
        returns (bool success)
    {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (addAddressToWhitelist(addrs[i])) {
                numWhitelisted += 1;
                success = true;
            }
        }
    }

    /*
     * @dev remove an address from the whitelist
     * @param addr address
     * @return true if the address was removed from the whitelist,
     * false if the address wasn't in the whitelist in the first place
     */
    function removeAddressFromWhitelist(address addr)
        public
        onlyCreator
        returns (bool success)
    {
        if (whitelist[addr]) {
            whitelist[addr] = false;
            emit WhitelistedAddressRemoved(addr);
            numWhitelisted -= 1;
            success = true;
        }
    }

    /*
     * @dev remove addresses from the whitelist
     * @param addrs addresses
     * @return true if at least one address was removed from the whitelist,
     * false if all addresses weren't in the whitelist in the first place
     */
    function removeAddressesFromWhitelist(address[] memory addrs)
        public
        onlyCreator
        returns (bool success)
    {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (removeAddressFromWhitelist(addrs[i])) {
                numWhitelisted -= 1;
                success = true;
            }
        }
    }
}
