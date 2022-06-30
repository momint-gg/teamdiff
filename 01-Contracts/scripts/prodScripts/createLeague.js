require("dotenv").config({ path: "../../.env" });
const { ethers } = require("hardhat");
// TODO: Comment out which one you're not using
const CONTRACTS = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby.js");
const LeagueOfLegendsLogicJSON = require("../../../02-DApp/backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json");
// const CONTRACTS = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddressesMatic.js");
// const LeagueOfLegendsLogicJSON = require('../../../02-DApp/backend/contractscripts/contract_info/maticAbis/LeagueOfLegendsLogic.json')

async function main() {
  // Getting our LeagueMaker contract
  const LeagueMakerContract = await ethers.getContractAt(
    "LeagueMaker",
    CONTRACTS.LeagueMaker
  );
  console.log("Got league maker contract");

  const numLeagues = Number(await LeagueMakerContract.leagueAddresses());
  console.log("Num leagues before making new league is ", numLeagues);
  // Creating a new league
  const txn = await LeagueMakerContract.createLeague(
    "Test league x", // League name
    0, // Stake amount (public)
    true, // Is public
    owner.address, // Admin for league proxy - actually don't need to pass this in bc is msg.sender...
    CONTRACTS.TestUSDC, // Test USDC address -- when deploying to mainnet won't need this
    CONTRACTS.Athletes, // Address of our athletes storage contract
    CONTRACTS.GameItems, // GameItems contract address
    [] //Whitelisted users
  );
  await txn.wait();

  const numLeaguesAfter = Number(
    await LeagueMakerContract.getLeagueAddresses()
  );
  console.log("Num leagues after making new league is ", numLeaguesAfter);
}

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
