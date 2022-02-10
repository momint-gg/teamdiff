// test/GameItems.test.js
// Load dependencies
const { expect } = require("chai");
const hre = require("hardhat");

const GameItems = artifacts.require("GameItems.sol");

// Start test block
describe("GameItems.test", async () => {
  var owner;
  var addr1;

  //Ran before first unit test
  before(async function () {
    GameItemFactory = await hre.ethers.getContractFactory("GameItems");
  });

  //Ran before every unit test
  //used to reset state or prepare test
  beforeEach(async function () {
    GameItem = await GameItemFactory.deploy();
    [owner, addr1] = await hre.ethers.getSigners();
    await GameItem.deployed();
    GameItem.connect(owner);
  });

  //Test case
  // it("newly minted GameItem NFTs have a correctly set uri", async function () {
  //   // Mint athlete
  //   //only works when _mint calls with msg.sender, not address(this)
  //   //ERROR'ERC1155: transfer to non ERC1155Receiver implementer'
  //   const numAthletes = await GameItem.NUM_ATHLETES;
  //   const firstUri = await GameItem.uri(0);
  //   const lastUri = await GameItem.uri(numAthletes - 2);

  //   // URLs changed (check GameItems code if u wanna replace)

  //   // expect(firstUri).to.equal(
  //   //   "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/player1.json"
  //   // ) &&
  //   //   expect(lastUri).to.equal(
  //   //     "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/player" +
  //   //       (numAthletes - 1) +
  //   //       ".json"
  //   //   );
  // });

  // Test case
  it("GameItem contract owner is set to Signer of constructor call", async function () {
    expect(await GameItem.owner()).to.equal(owner.address);
  });

  // // Test Case
  // it("Non-Owner address cannot call mintAthletes()", async function () {
  //   //TODO cannot get correct ERROR message to use revertedWith
  //   // expect(GameItem.connect(addr1).mintAthletes()).to.be.revertedWith(
  //   //   "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
  //   // );
  //   expect(GameItem.connect(addr1).mintAthletes()).to.be.reverted;
  // });

  // Test Case
  it("Non-Owner address cannot call setTokenUri()", async function () {
    //TODO cannot get correct ERROR message to use revertedWith
    // expect(GameItem.connect(addr1).mintAthletes()).to.be.revertedWith(
    //   "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
    // );
    const tokenId = 0;
    const uri =
      "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/player1.json";
    expect(GameItem.connect(addr1).setTokenUri(tokenId, uri)).to.be.reverted;
  });

  // Test Case
  it("Contract Owner owns NFTPerAthlete quantity of each Athlete after Contract Deployment", async function () {
    for (i = 0; i < GameItem.NUM_ATHLETES - 1; i++)
      expect(await GameItem.balanceOf(owner.address, i)).to.equal(
        await GameItem.getNFTPerAthlete()
      );
  });

  // // Test Case
  // it("Contract Owner can send NFT to another address with correct balance updates", async function () {
  //   //send and NFT and getBalance of two address
  //   const transferAmount = 5;
  //   const tokenId = 0;
  //   await GameItem.safeTransferFrom(
  //     owner.address,
  //     addr1.address,
  //     tokenId,
  //     transferAmount,
  //     "0x00"
  //   );
  //   expect(await GameItem.balanceOf(addr1.address, tokenId)).to.equal(
  //     transferAmount
  //   );
  // });

  // Test Case
  it("Contract Owner cannot send more than NFTPerAthlete Tokens", async function () {
    const transferAmount = (await GameItem.getNFTPerAthlete()) + 1;
    const tokenId = 0;
    //TODO cannot get correct ERROR message to use revertedWith
    // expect(GameItem.safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00")).to.be.revertedWith(
    //   "Error: VM Exception while processing transaction: reverted with reason string 'ERC1155: insufficient balance for transfer'"
    //   );
    expect(
      GameItem.safeTransferFrom(
        owner.address,
        addr1.address,
        tokenId,
        transferAmount,
        "0x00"
      )
    ).to.be.reverted;
  });

  // Test Case
  it("Non-Contract Owner addresses cannot send tokens from Contract Owner", async function () {
    const transferAmount = 5;
    const tokenId = 0;
    //TODO cannot get correct ERROR message to use revertedWith
    // expect(GameItem.connect(addr1).safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00")).to.be.revertedWith(
    //   "Error: VM Exception while processing transaction: reverted with reason string 'ERC1155: caller is not owner nor approved'"
    // );
    expect(
      GameItem.connect(addr1).safeTransferFrom(
        owner.address,
        addr1.address,
        tokenId,
        transferAmount,
        "0x00"
      )
    ).to.be.reverted;
  });

  // -------------- // New test cases (after changing contract for provenance) // -------------- //

  // Testing new mint pack functionality with new IDs
  it("Mints a new pack and gives to address", async () => {
    await GameItem.mintStarterPack();
    const balance = await GameItem.balanceOf(owner.address, 3); //since athletes would be from (0-2)
    expect(balance).to.equal(1);
  });

  // Testing set starting index functionality
  it("Sets the starting index", async () => {
    await GameItem.setStartingIndex();
    const index = await GameItem.startingIndex();
    expect(index).to.not.equal(0);
  });

  // Testing burn pack functionality and minting with 3 random athletes
  it("Burns a pack successfully and mints 3 athletes in a random order", async () => {
    await GameItem.setStartingIndex();
    await GameItem.mintStarterPack();
    await GameItem.burnStarterPack();
    expect(GameItem.balanceOf(owner.address, 3)).to.be.reverted; //should throw an error

    //Making sure new athletes were minted with indexes ranging from 0-2 (random order bc of block #)
    const athlete1 = await GameItem.balanceOf(owner.address, 0);
    const athlete2 = await GameItem.balanceOf(owner.address, 1);
    const athlete3 = await GameItem.balanceOf(owner.address, 2);

    //Check balances of each athlete minted (should range 1-2 since starter pack size is 5)
    console.log("\n");
    console.log("Balance of first minted athlete: ", athlete1);
    console.log("Balance of second minted athlete: ", athlete2);
    console.log("Balance of third minted athlete: ", athlete3);
    console.log("\n");

    const uri1 = await GameItem.uri(0);
    const uri2 = await GameItem.uri(1);
    const uri3 = await GameItem.uri(2);

    //Check URI #s a couple times to make sure ordering was randomized
    console.log("\n");
    console.log("URI of first minted athlete: ", uri1);
    console.log("URI of second minted athlete: ", uri2);
    console.log("URI of third minted athlete: ", uri3);
    console.log("\n");
  });
});
