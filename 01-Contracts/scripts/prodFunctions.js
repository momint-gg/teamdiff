require("dotenv").config({ path: "../.env" });
const { ethers } = require("hardhat");
const RinkebyLeagueOfLegendsLogicABI = require("../../02-DApp/backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json");
const MaticLeagueOfLegendsLogicABI = require("../../02-DApp/backend/contractscripts/contract_info/maticAbis/LeagueOfLegendsLogic.json");

const RINKEBY_CONTRACTS = require("../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby.js");
const MATIC_CONTRACTS = require("../../02-DApp/backend/contractscripts/contract_info/contractAddressesMatic.js");

const main = async (funcName) => {
  const network = hre.network.name;

  console.log(network);
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
