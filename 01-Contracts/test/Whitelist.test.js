// Testing our GameItems whitelist

const { expect } = require("chai");
const { ethers } = require("hardhat");
const constructorArgs = require("../constructorArgs");

describe("Testing whitelist for GameItems", async () => {
  before(async () => {
    GameItemFactory = await ethers.getContractFactory("GameItems");
    GameItem = await GameItemFactory.deploy(...constructorArgs);
    [owner, addr1] = await ethers.getSigners();
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
    expect(await GameItem.mintStarterPack()).to.be.revertedWith(
      "Error: Transaction reverted without a reason string"
    );
  });

  it("Adds addr1 to the whitelist", async () => {
    const addUser = await GameItem.connect(owner).addUserToWhitelist(
      owner.address
    );
    await addUser.wait();
  });

  it("Lets addr1 mint a pack now that they're whitelisted", async () => {
    let txn = await GameItem.connect(owner).mintStarterPack();
    await txn.wait();

    // We should have ~1~ whitelisted user now!
    expect(
      Number(await GameItem.connect(owner).getWhitelistedUsers())
    ).to.equal(1);
  });
});
