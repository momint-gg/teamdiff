// Load dependencies
const { expect } = require("chai");
const hre = require("hardhat");

const GameItems = artifacts.require("GameItems.sol");
const constructorArgs = require("../constructorArgs");

// Make sure we test this on Rinkeby!
describe("RandomNumberGenerator.test", async () => {
  //Ran before first unit test
  before(async function () {
    GameItemFactory = await hre.ethers.getContractFactory("GameItems");
  });

  //Ran before every unit test
  //used to reset state or prepare test
  beforeEach(async function () {
    GameItem = await GameItemFactory.deploy(...constructorArgs);
    [owner, addr1] = await hre.ethers.getSigners();
    await GameItem.deployed();
    GameItem.connect(owner);
    console.log("Deployed to: " + GameItem.address);
  });
});
