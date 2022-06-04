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
  // beforeEach(async () => {});

  // it("Correctly sets up GameItems", async () => {
  //   expect(await GameItem.getNFTPerAthlete()).to.equal(10);
  // });

  // // This will throw an error -- for some reason having trouble getting Chai expect an error to work, but this is working
  // it("Doesnt let a non-whitelised user call mint pack", async () => {
  //   expect(GameItem.connect(owner).mintStarterPack()).to.be.reverted;
  //   // Logs an error
  // });

  it("Adds addr1 to the whitelist", async () => {
    const addUser = await GameItem.connect(owner).addUserToWhitelist(
      owner.address
    );
    await addUser.wait();
  });

  it("Num of whitelisted users is correct", async () => {
    // We should have ~1~ whitelisted user now!
    expect(Number(await GameItem.getNumWhitelisted())).to.equal(1);
  });

  it("Correctly allows a whitelisted user to mint a starter pack", async () => {
    let txn = await GameItem.setStartingIndex();
    console.log("Setting starting indices");
    await txn.wait();
    txn = await GameItem.setURIs(); // This takes awhile
    console.log("Setting URIs");
    await txn.wait();
    txn = await GameItem.connect(owner).mintStarterPack();
    await txn.wait();
    // Uncomment below if you want to test burn
    // txn = await GameItem.connect(owner).burnStarterPack();
    // await txn.wait();
  });
});
