const hre = require("hardhat");

const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory("GameItems");
  const gameContract = await gameContractFactory.deploy({
    //overriding gas bc transaction was stuck
    // gasPrice: 203000000000,
  });
  await gameContract.deployed();
  console.log("Contract deployed to:", gameContract.address);
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

//Latest contract address (rinkeby) 2/8/22 -- 0x7B891dca5fb2947B4C5bb70D1a60e1cA0895943C
