const { ethers, upgrades } = require("hardhat");
var Web3 = require("web3");
const web3 = new Web3("https://cloudflare-eth.com");

async function main() {
  // Deploying

  //Create GAme Logicr
  const GameItemsFactory = await ethers.getContractFactory("GameItems");
  const GameItemsInstance = await GameItemsFactory.deploy();
  await GameItemsInstance.deployed();
  console.log("GameItems deployed to:", GameItemsInstance.address);
}