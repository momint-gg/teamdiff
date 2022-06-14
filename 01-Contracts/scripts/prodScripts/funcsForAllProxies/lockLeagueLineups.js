require("dotenv").config({ path: "../.env" });
const { ethers } = require("hardhat");
const LeagueOfLegendsLogicABI = require("../../../../02-DApp/backend/contractscripts/contract_info/abis/LeagueOfLegendsLogic.json");
const CONTRACTS = require("../../../../02-DApp/backend/contractscripts/contract_info/contractAddresses.js");

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
  for (let i = 0; i < leagueAddresses.length; i++) {
    currProxy = new ethers.Contract(
      leagueAddresses[i],
      LeagueOfLegendsLogicABI.abi,
      provider
    );
    AllLeagueInstances.push(currProxy);
  }

  // Looping through all of our proxies
  let currLeague;
  let txn;
  for (let i = 0; i < AllLeagueInstances.length; i++) {
    currLeague = AllLeagueInstances[i];
    txn = await currLeague.lockLineup();
    await txn.wait();

    txn = await currLeague.lineupIsLocked();
    txn === true
      ? console.log("Lineup successfully locked for proxy ", currLeague.address)
      : console.log("Failed");
    console.log("Lineup is locked: ", txn);
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
