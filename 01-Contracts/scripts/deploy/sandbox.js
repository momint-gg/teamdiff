const { ethers } = require("hardhat");
// import { providers } from "ethers";
const CONTRACT_ADDRESSES = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddresses.js");


const main = async () => {
  console.log("sandboxing...");

    // Create GameItems Instance
  const gameContract = await ethers.getContractAt("GameItems", CONTRACT_ADDRESSES.GameItems)


  console.log("got game items address")


  // //Set Private Sale Open ready for testing
  // console.log("Opening private Sale");
  // txn = await gameContract.openPrivateSale();
  // await txn.wait();
  
  //Set Public Sale Open ready for testing
  console.log("Opening public sale");
  txn = await gameContract.openPublicSale();
  await txn.wait();

  //Set Private Sale Open ready for testing
  // console.log("Opening burning reveal");
  // txn = await gameContract.setPacksReady();
  // await txn.wait();

  console.log("Sandbox script complete")

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

//Latest contract address (rinkeby) --> 0x94b90ca07014F8B67A6bCa8b1b7313d5fD8D2160 (created 2/10 4pm)
