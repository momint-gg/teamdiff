require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");
const abi = require("../contract_info/abis/LeagueMaker.json");
const { LeagueMaker } = require("../contract_info/contractAddresses");
const LeagueOfLegendsLogicJSON = require("../contract_info/abis/LeagueOfLegendsLogic.json");
const CONTRACT_ADDRESSES = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddresses.js");

async function main() {
  // Getting our contract

  // Getting our list of proxies
  const leagueAddresses = await LeagueMakerContract.connect(
    rinkebySigner
  ).getLeagueAddresses();

  // Creating interactable contract list of proxies
  AllLeagueInstances = []; // all of our leagues (as CONTRACTS) so we can interact with them
  let currProxy;
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
    currLeague = AllLeagueInstances[i].connect(rinkebySigner);
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
