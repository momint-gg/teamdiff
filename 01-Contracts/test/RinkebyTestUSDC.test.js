const testUSDC = artifacts.require("TestUSDC");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Rinkeby USDC Test", async () => {
  before(async () => {
    TestUSDCFactory = await ethers.getContractFactory("TestUSDC");
    TestUSDCContract = await TestUSDCFactory.deploy();
    [owner, addr1] = await ethers.getSigners();
    await TestUSDCContract.deployed();
    TestUSDCContract.connect(owner);
    console.log("Test USDC Contract deployed to: " + TestUSDCContract.address);
  });

  beforeEach(async () => {});

  it("Gets the balance correctly for the owner", async () => {
    const balance = await TestUSDCContract.balanceOf(owner.address);
    console.log("Balance is ", balance);
    expect(Number(balance)).to.equal(100);
  });
});
