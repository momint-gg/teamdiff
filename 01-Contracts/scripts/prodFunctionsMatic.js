require("dotenv").config({ path: "../.env" });
const { ethers } = require("hardhat");

// const MaticLeagueOfLegendsLogicABI = require("../../02-DApp/backend/contractscripts/contract_info/maticAbis/LeagueOfLegendsLogic.json");
// const MATIC_CONTRACTS = require("../../02-DApp/backend/contractscripts/contract_info/contractAddressesMatic.js");

const main = async (funcName) => {
  
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
