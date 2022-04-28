// Testing our GameItems whitelist

const { expect } = require("chai");
const { ethers } = require("hardhat");
const constructorArgs = require("../constructorArgs");

describe("Testing whitelist for GameItems", async () => {
  before(async () => {
    GameItemFactory = await ethers.getContractFactory("GameItems");
    GameItem = await GameItemFactory.deploy(...constructorArgs);
    [owner, addr1, addr2] = await ethers.getSigners();
    await GameItem.deployed();
    GameItem.connect(owner);
    console.log("GameItems.sol deployed to: " + GameItem.address);
  });

  //Ran before every unit test
  //used to reset state or prepare test
  beforeEach(async () => {});

  it("Correctly sets up GameItems", async () => {
    expect(await GameItem.getNFTPerAthlete()).to.equal(10);
  });

  it("Doesnt let a non-whitelised user call mint pack", async () => {
    expect(await GameItem.connect(owner).mintStarterPack()).to.be.reverted;
  });

  // This should throw an error
  it("Adds addr1 to the whitelist", async () => {
    const addUser = await GameItem.connect(owner).addUserToWhitelist(
      addr1.address
    );
    await addUser.wait();
  });

  // This is working though...
  it("Num of whitelisted users is correct", async () => {
    // We should have ~1~ whitelisted user now!
    expect(Number(await GameItem.getWhitelistedUsers())).to.equal(1);
  });

  // WHY ISN'T THIS WORKING ???
  it("Correctly allows a whitelisted user to mint a starter pack", async () => {
    let txn = await GameItem.connect(addr1).mintStarterPack();
    await txn.wait();
  });
});
