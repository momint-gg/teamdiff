const { ethers, upgrades } = require("hardhat");

async function main() {
  // Deploying
  const LogicLayer = await ethers.getContractFactory("GameLogic");
  const instance = await upgrades.deployProxy(LogicLayer, [42]);
  await instance.deployed();
  //await box.deployed();
  console.log("GameLogic deployed to:", instance.address);
  console.log("GameLogic secretNumber: " + await instance.secretNumber());
  console.log("GameLogic Version: " +await  instance.version());
  // Upgrading
//   const LogicLayerV2 = await ethers.getContractFactory("BoxV2");
//   const upgraded = await upgrades.upgradeProxy(instance.address, LogicLayerV2);
}

main();