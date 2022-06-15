// Opening up the private sale for everyone (to be run on 6/10)

require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");
// TODO: Comment out which one you're not using
const CONTRACTS = require("../../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby.js");
// const CONTRACTS = require("../../../../02-DApp/backend/contractscripts/contract_info/contractAddressesMatic.js");

// TODO:
const main = async () => {
  const GameItemsContract = await ethers.getContractAt(
    "GameItems",
    CONTRACTS.GameItems
  );

  let txn = await GameItemsContract.openBoosterPackSale();
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
