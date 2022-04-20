// Testing the mint / burn flow for starter packs
// Test this on rinkeby to see actual NFTs in your wallet

const { expect } = require("chai");
const hre = require("hardhat");
const GameItems = artifacts.require("GameItems.sol");
const constructorArgs = require("../constructorArgs");

describe("Minting flow test", async () => {
  var owner;
  var addr1;

  //Ran before first unit test
  before(async () => {
    GameItemFactory = await hre.ethers.getContractFactory("GameItems");
  });

  //Ran before every unit test
  //used to reset state or prepare test
  beforeEach(async () => {
    GameItem = await GameItemFactory.deploy(...constructorArgs);
    [owner, addr1] = await hre.ethers.getSigners();
    await GameItem.deployed();
    GameItem.connect(owner);
    console.log("Deployed to: " + GameItem.address);
  });

  // Baseline working
  it("Receives constructor arguments properly", async () => {
    const starterPackSize = await GameItem.getNFTPerAthlete();
    console.log("Starter pack size is ", starterPackSize);
    expect(Number(starterPackSize)).to.equal(10);
  });

  // Test on Rinkeby!
  // Testing to see if a pack is given to the caller
  //   it("Sets the starting index, URIs, and mints a starter pack ", async () => {
  //     let txn = await GameItem.setStartingIndex();
  //     console.log("Setting starting indices");
  //     await txn.wait();
  //     txn = await GameItem.setURIs(); // This takes awhile
  //     console.log("Setting URIs");
  //     await txn.wait();
  //     txn = await GameItem.mintStarterPack();
  //     console.log("Minting starting pack");
  //     await txn.wait();
  //     console.log("Starter pack minted to owner: ", owner.address);
  //   });

  // Testing to see if 5 athletes are minted to caller with correct metadata
  it("Burns a pack successfully and mints 5 athletes in a random order", async () => {
    let txn = await GameItem.setStartingIndex();
    console.log("Setting starting indices");
    await txn.wait();
    txn = await GameItem.setURIs(); // This takes awhile
    console.log("Setting URIs");
    await txn.wait();
    txn = await GameItem.mintStarterPack();
    console.log("Minting starting pack");
    await txn.wait();
    console.log("Starter pack minted to owner: ", owner.address);
    txn = await GameItem.burnStarterPack(); // If we check wallet, should have athlete NFTs now
    console.log("Burning starter pack");
    await txn.wait();
  });
});
