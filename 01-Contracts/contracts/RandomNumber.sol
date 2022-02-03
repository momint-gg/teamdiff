//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//Generating random number for when users mint a pack

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract RandomNumber is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomResult;

    uint256 numAthletes;
    uint256 startingNum;

    //Chainlink VRF Contract addresses: https://docs.chain.link/docs/vrf-contracts/
    constructor(uint256 numOfAthletes, uint256 startingNum)
        VRFConsumerBase(
            0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709 // LINK Token
        )
    {
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10**18; // 0.1 LINK (Fee varies by network)
    }

    //Requesting randomness
    function getRandomNumber() public returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(keyHash, fee);
    }

    //Callback function
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = (randomness % numAthletes) + startingNum;
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
