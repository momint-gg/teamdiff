const hre = require("hardhat");
const constructorArgs = require("../../constructorArgs");

const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory("GameItems");
  const gameContract = await gameContractFactory.deploy(...constructorArgs, {
    //overriding gas bc transaction was stuck
    //gasPrice: 203000000000,
  });
  await gameContract.deployed();
  
  //Initial functions that need to be run
  // console.log("First setting starting index...");
  // let txn = await gameContract.setStartingIndex();
  // await txn.wait();
  // console.log("Now setting token URIs...");
  // txn = await gameContract.setURIs();
  // await txn.wait();
  
  console.log(
    "Contract deployed to:",
    gameContract.address,
    " and URIs are all set."
  );
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
