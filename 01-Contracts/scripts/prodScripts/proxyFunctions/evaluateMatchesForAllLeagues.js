require("dotenv").config({ path: "../../.env" });
const { ethers } = require("hardhat");
// TODO: Comment out which one you're not using
const CONTRACTS = require("../../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby.js");
const LeagueOfLegendsLogicJSON = require("../../../../02-DApp/backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json");
// const CONTRACTS = require("../../../../02-DApp/backend/contractscripts/contract_info/contractAddressesMatic.js");
// const LeagueOfLegendsLogicJSON = require('../../../../02-DApp/backend/contractscripts/contract_info/maticAbis/LeagueOfLegendsLogic.json')

async function main() {
  // Getting our LeagueMaker contract
  const LeagueMakerContract = await ethers.getContractAt(
    "LeagueMaker",
    CONTRACTS.LeagueMaker
  );
  console.log("Got league maker contract");

  // Getting our list of proxies
  const leagueAddresses = await LeagueMakerContract.getLeagueAddresses();

  // Creating interactable contract list of proxies
  AllLeagueInstances = []; // all of our leagues (as CONTRACTS) so we can interact with them
  let currProxy;
  // TODO: Test to see if there will be errors with this on matic mainnet
  for (let i = 0; i < leagueAddresses.length; i++) {
    currProxy = new ethers.Contract(
      leagueAddresses[i],
      LeagueOfLegendsLogicJSON.abi,
      provider
    );
    AllLeagueInstances.push(currProxy);
  }

  // Looping through all of our proxies and evaluating matches
  let currLeague;
  let txn;
  for (let i = 0; i < AllLeagueInstances.length; i++) {
    txn = await currLeague.evaluateMatches();
    await txn.wait();
  }
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
