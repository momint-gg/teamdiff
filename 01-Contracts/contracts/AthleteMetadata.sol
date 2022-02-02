//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//Contract for if we need to pull athlete data from API
contract AthleteMetadata is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    //4 tasks in the job: HTTPGet, JSON Parse, Eth bytes 32, Eth Transaction
    bytes32 jobId = "63a9627cb5f848218dcd796b454a0032";
    address ORACLE_ADDRESS =
        address(0x9257E0700b0ecbc83ff8C465d8E000fF88c0FEc7);

    struct Athlete {
        string name;
        string team;
        string position;
    }
    Athlete[] public AthleteList;

    // string fiewsJobId = "0d21526754cc4cc3a53f1d4973454adc";
    // address fiewsOracleAddy = "0x049Bd8C3adC3fE7d3Fc2a44541d955A537c2A484";
    string allAthletesURL =
        "https://ipfs.io/ipfs/QmRm8V75D4HFTBNtSzjaG42nBnyZyrMEj45kJZ3xnMh9nW?filename=allAthletes.json";

    function getAllAthletes() public onlyOwner {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );
        req.add("get", allAthletesURL);
        sendChainlinkRequestTo(ORACLE_ADDRESS, req, 0.1 * 10**18);
    }

    //Customizing what to do with the data once received
    function fulfill(bytes32 _requestId, Athlete[] memory res)
        public
        recordChainlinkFulfillment(_requestId)
    {
        console.log(res);
        AthleteList = res;
    }
}

//SOURCES:
//Chainlink documentation for GET requests (ChainlinkClient): https://docs.chain.link/docs/make-a-http-get-request/
//YouTube video for connecting Chainlink to an API: https://www.youtube.com/watch?v=AtHp7me2Yks&t=294s&ab_channel=Chainlink
