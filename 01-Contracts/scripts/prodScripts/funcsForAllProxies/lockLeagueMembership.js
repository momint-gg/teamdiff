require("dotenv").config({ path: "../../.env" });
const { ethers } = require("ethers");
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

  // Getting our list of proxies
  const leagueAddresses = await LeagueMakerContract.getLeagueAddresses();

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

  // Looping through all of our proxies
  let currLeague;
  let txn;
  for (let i = 0; i < AllLeagueInstances.length; i++) {
    currLeague = AllLeagueInstances[i];
    txn = await currLeague.setLeagueEntryIsClosed();
    await txn.wait();

    txn = await currLeague.leagueEntryIsClosed();
    txn === false
      ? console.log("League membership successfully locked!")
      : console.log("Failed");
    console.log("League membership is locked: ", txn);
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
