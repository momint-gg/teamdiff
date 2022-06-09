// Testing our GameItems functionality
// (Should run on hardhat for expects to work)

const { expect } = require("chai");
const { ethers } = require("hardhat");
const constructorArgs = require("../../constructorArgs");

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
    expect(await GameItem.name()).to.equal("TeamDiff");
  });

  it("Adds addr1 to the whitelist and sets up GameItems", async () => {
    let txn = await GameItem.setStartingIndex();
    console.log("Setting starting indices");
    await txn.wait();
    txn = await GameItem.setURIs(); // This takes awhile
    console.log("Setting URIs");
    await txn.wait();

    const addUser = await GameItem.connect(owner).addUsersToWhitelist([
      //Note: pass in as array in js script
      owner.address,
      addr2.address,
    ]);
    await addUser.wait();
  });

  it("Num of whitelisted users is correct", async () => {
    // We should have ~2~ whitelisted users now!
    expect(Number(await GameItem.getNumWhitelisted())).to.equal(2);
  });

  it("Shouldn't let anyone mint pre sale", async () => {
    expect(GameItem.connect(owner).mintStarterPack()).to.be.revertedWith(
      "Private sale hasn't opened yet."
    );
  });

  it("Let's a user mint now.. Shouldn't let a non whitelisted user mint in the private sale phase", async () => {
    // Opening private sale
    let txn = await GameItem.connect(owner).openPrivateSale();
    await txn.wait();
    // Whitelisted users can mint packs
    txn = await GameItem.connect(addr2).mintStarterPack();
    await txn.wait();
    txn = await GameItem.connect(owner).mintStarterPack();
    await txn.wait();
    // Non whitelisted users can't mint packs yet
    expect(GameItem.connect(addr1).mintStarterPack()).to.be.revertedWith(
      "User is not whitelisted."
    );
  });

  it("Should let anyone mint after the private sale phase", async () => {
    // Opening up the public sale phase
    let txn = await GameItem.connect(owner).openPublicSale();
    await txn.wait();
    // Now addr1 should be able to mint
    txn = await GameItem.connect(addr1).mintStarterPack();
    await txn.wait();
  });

  it("Shouldn't let anyone mint a booster pack yet", async () => {
    expect(GameItem.connect(owner).mintBoosterPack()).to.be.revertedWith(
      "Booster packs cannot be opened yet!"
    );
  });

  it("Lets those who are valid open booster packs when time is ready ", async () => {
    // Flipping the switch to allow booster packs
    let txn = await GameItem.connect(owner).allowBoosterPacks();
    await txn.wait();
    // Minting a booster pack
    txn = await GameItem.connect(owner).mintBoosterPack();
    await txn.wait();

    // Making sure invalid people can't mint em (need to have minted a starter pack)
    // Actually deleting the below.. anyone can mint a booster pack!
    // expect(GameItem.connect(addr1).mintBoosterPack()).to.be.revertedWith(
    //   "You must have minted a starter pack to mint a booster pack."
    // );
  });
});
