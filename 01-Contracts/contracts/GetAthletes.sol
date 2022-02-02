//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

//Contract for if we need to pull athlete data from API
//Chainlink documentation for GET requests (ChainlinkClient): https://docs.chain.link/docs/make-a-http-get-request/
contract GetAthletes is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    //4 tasks in the job: HTTPGet, JSON Parse, Eth bytes 32, Eth Transaction
    string jobId = "63a9627cb5f848218dcd796b454a0032";
    address oracleAddy = "0x9257E0700b0ecbc83ff8C465d8E000fF88c0FEc7";
    // string fiewsJobId = "0d21526754cc4cc3a53f1d4973454adc";
    // address fiewsOracleAddy = "0x049Bd8C3adC3fE7d3Fc2a44541d955A537c2A484";

    function getAllAthletes() public onlyOwner {
        Chainlink.Request memory req = 
    }

    function fulfill() {

    }
}