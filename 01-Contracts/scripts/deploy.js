const hre = require("hardhat");

const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory("GameItems");
  const gameContract = await gameContractFactory.deploy();
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

//Latest contract address (rinkeby) -- 0x640E8429c3700Fb1Ca8d65cf60b1b9b579BCe19B
