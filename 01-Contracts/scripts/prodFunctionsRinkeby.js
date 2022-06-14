require("dotenv").config({ path: "../.env" });
const { ethers } = require("hardhat");
// const RinkebyLeagueOfLegendsLogicABI = require("../../02-DApp/backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json");
// const RINKEBY_CONTRACTS = require("../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby.js");

const main = async () => {
  for (let i = 0; i < process.argv.length; i++) {
    console.log(process.argv[i]);
  }
  const funcName = process.argv[2];
  console.log(funcName);

  //   console.log(network);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
