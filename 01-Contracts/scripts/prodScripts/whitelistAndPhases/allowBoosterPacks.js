// Allowing booster packs to be opened (to be run on TBD)

require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");
// TODO: Comment out which one you're not using
const CONTRACTS = require("../../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby.js");
// const CONTRACTS = require("../../../../02-DApp/backend/contractscripts/contract_info/contractAddressesMatic.js");

const main = async () => {
  // Getting our contract
  const GameItemsContract = await ethers.getContractAt(
    "GameItems",
    CONTRACTS.GameItems
  );

  let txn = await GameItemsContract.allowBoosterPacks();
  await txn.wait();
};

const runMain = async () => {
  try {
    console.log("Running main...\n");
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
