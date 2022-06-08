const { ethers } = require("hardhat");
const GameItemsJSON = require("../../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
// import { providers } from "ethers";
const CONTRACT_ADDRESSES = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddresses.js");


const main = async () => {
  console.log("sandboxing...");
  const gameContract = await ethers.getContractAt("GameItems", CONTRACT_ADDRESSES.GameItems)
  // Create GameItems Instance
//   const gameContract = hre.ethers.Contract(
//     CONTRACT_ADDRESSES.GameItems,
//     GameItemsJSON.abi,
    
//   );

  console.log("got game items address")
  //Add users to gameitems whitelist
  txn = await gameContract.addUserToWhitelist("0x14D8DF624769E6075769a59490319625F50B2B17")
  await txn.wait();
  console.log("Added Trey to whitelist");
  gameContract.addUserToWhitelist("0xD926A3ddFBE399386A26B4255533A865AD98f7E3")
  await txn.wait();
  console.log("Added Trey2 to whitelist");

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
