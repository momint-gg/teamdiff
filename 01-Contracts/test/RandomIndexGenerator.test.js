// Load dependencies
const { expect } = require("chai");
const hre = require("hardhat");

const GameItems = artifacts.require("GameItems.sol");
const constructorArgs = require("../constructorArgs");

// Make sure we test this on Rinkeby!
describe("RandomNumberGenerator.test", async () => {
  //Ran before first unit test
  before(async function () {
    ContractFactory = await hre.ethers.getContractFactory("RandomIndexGen");
  });

  //Ran before every unit test
  //used to reset state or prepare test
  beforeEach(async function () {
    Contract = await ContractFactory.deploy(...constructorArgs);
    [owner, addr1] = await hre.ethers.getSigners();
    await Contract.deployed();
    Contract.connect(owner);
    console.log("Deployed to: " + GameItem.address);
  });

  it("Generates random words", async () => {
    const num = await GameItem;
  });
});
