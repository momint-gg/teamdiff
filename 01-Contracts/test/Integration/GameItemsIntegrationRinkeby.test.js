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
    ]);
    await addUser.wait();
  });

  it("Let's a user mint now.. Shouldn't let a non whitelisted user mint in the private sale phase", async () => {
    // Opening private sale
    let txn = await GameItem.connect(owner).openPrivateSale();
    await txn.wait();
    // Whitelisted users can mint packss
    txn = await GameItem.connect(owner).mintStarterPack();
    await txn.wait();
    // Now burning a starter pack
    // txn = await GameItem.allowStarterPacks();
    // await txn.wait();
    // txn = await GameItem.burnStarterPack();
    // await txn.wait();
  });

  //   it("Let's a user mint now.. Shouldn't let a non whitelisted user mint in the private sale phase", async () => {
  //     // Opening private sale
  //     let txn = await GameItem.connect(owner).openPrivateSale();
  //     await txn.wait();
  //     // Whitelisted users can mint packss
  //     txn = await GameItem.connect(owner).mintBoosterPack();
  //     await txn.wait();
  //     // Now burning a booster pack
  //     txn = await GameItem.alowBoosterPacks();
  //     await txn.wait();
  //     txn = await GameItem.burnBoosterPack();
  //     await txn.wait();
  //   });
});
