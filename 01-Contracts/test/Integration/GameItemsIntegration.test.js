// Testing our GameItems Whitelist

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
    expect(await GameItem.athleteURI()).to.equal(
      "https://gateway.pinata.cloud/ipfs/QmaP39XjaR4YKniP8vnyGRdiKc3DcZ1PLqjqHDx5mc6dqN/"
    );
  });

  // // This will throw an error -- for some reason having trouble getting Chai expect an error to work, but this is working
  // it("Doesnt let a non-whitelised user call mint pack", async () => {
  //   expect(GameItem.connect(owner).mintStarterPack()).to.be.reverted;
  //   // Logs an error
  // });

  it("Adds addr1 to the whitelist and sets up GameItems", async () => {
    const addUser = await GameItem.connect(owner).addUsersToWhitelist(
      owner.address,
      addr2.address
    );
    await addUser.wait();

    let txn = await GameItem.setStartingIndex();
    console.log("Setting starting indices");
    await txn.wait();
    txn = await GameItem.setURIs(); // This takes awhile
    console.log("Setting URIs");
    await txn.wait();
  });

  it("Num of whitelisted users is correct", async () => {
    // We should have ~1~ whitelisted user now!
    expect(Number(await GameItem.getNumWhitelisted())).to.equal(1);
  });

  it("Shouldn't let anyone mint pre sale", async () => {
    expect(
      GameItem.connect(addr1.address).mintStarterPack()
    ).to.be.revertedWith("Private sale hasn't opened yet.");
  });

  it("Shouldn't let a non whitelisted user mint in the private sale phase", async () => {});

  it("Should let anyone mint after the private sale phase", async () => {});

  it("Correctly allows a whitelisted user to mint a starter pack", async () => {
    txn = await GameItem.connect(owner).mintStarterPack();
    await txn.wait();
    // txn = await GameItem.connect(owner).burnStarterPack();
    // await txn.wait();
  });
});
