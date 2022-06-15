// Testing our GameItems functionality
// This should be run on Matic

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

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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

  it("Starter pack test on mainnet", async () => {
    // Opening private sale
    let txn = await GameItem.connect(owner).openPrivateSale();
    await txn.wait();
    // Whitelisted users can mint packss
    txn = await GameItem.connect(owner).mintStarterPack();
    await txn.wait();
    console.log("Waiting 2 min to burn starter pack. Check metadata!");
    delay(120000); // Waiting 2 mins so we can check metadata

    // Now burning a starter pack
    txn = await GameItem.connect(owner).allowStarterPacks();
    await txn.wait();
    txn = await GameItem.connect(owner).burnStarterPack();
    await txn.wait();
  });

  it("Booster pack test on mainnet", async () => {
    // Minting booster pack
    let txn = await GameItem.connect(owner).openBoosterPackSale();
    await txn.wait();
    txn = await GameItem.connect(owner).mintBoosterPack();
    await txn.wait();
    console.log("Waiting 2 min to burn booster pack. Check metadata!");
    delay(120000); // Waiting 2 mins so we can check metadata

    // Now burning a booster pack
    txn = await GameItem.connect(owner).allowBoosterPacks();
    await txn.wait();
    txn = await GameItem.connect(owner).burnBoosterPack();
    await txn.wait();
  });
});
