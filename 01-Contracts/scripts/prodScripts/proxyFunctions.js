require("dotenv").config({ path: "../../../.env" });
const { ethers } = require("ethers");
const abi = require("../contract_info/abis/LeagueMaker.json");
const { LeagueMaker } = require("../contract_info/contractAddresses");
const LeagueOfLegendsLogicJSON = require("../contract_info/abis/LeagueOfLegendsLogic.json");
const CONTRACT_ADDRESSES = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddresses.js");

const run = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

run();
