// test/GameItems.test.js
// Load dependencies
const { expect } = require("chai");
const hre = require("hardhat");

const GameItems = artifacts.require("GameItems.sol");
const constructorArgs = require("../constructorArgs");

// Start test block
//TODO: use openzeppeling Test scripts

// NOTE FOR TREY: TXN.WAIT() IS ONLY FOR TESTING ON RINKEBY (WAITING FOR TRANSACTION TO BE MINED). DO NOT DELETE!!
// ^ IF TESTING ON HARDHAT JUST COMMENT OUT

describe("GameItems.test", async () => {
  var owner;
  var addr1;

  //Ran before first unit test
  before(async function () {
    GameItemFactory = await hre.ethers.getContractFactory("GameItems");
  });

  //Ran before every unit test
  //used to reset state or prepare test
  before(async function () {
    GameItem = await GameItemFactory.deploy(...constructorArgs);
    [owner, addr1] = await hre.ethers.getSigners();
    await GameItem.deployed();
    GameItem.connect(owner);
    console.log("Deployed to: " + GameItem.address);
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
  // it("GameItem contract owner is set to Signer of constructor call", async function () {
  //   expect(await GameItem.owner()).to.equal(owner.address);
  // });

  // // Test Case
  // it("Non-Owner address cannot call mintAthletes()", async function () {
  //   //TODO cannot get correct ERROR message to use revertedWith
  //   // expect(GameItem.connect(addr1).mintAthletes()).to.be.revertedWith(
  //   //   "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
  //   // );
  //   expect(GameItem.connect(addr1).mintAthletes()).to.be.reverted;
  // });

  // // Test Case
  // it("Non-Owner address cannot call setTokenUri()", async function () {
  //   //TODO cannot get correct ERROR message to use revertedWith
  //   // expect(GameItem.connect(addr1).mintAthletes()).to.be.revertedWith(
  //   //   "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
  //   // );
  //   const tokenId = 0;
  //   const uri =
  //     "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/player1.json";
  //   expect(GameItem.connect(addr1).setTokenUri(tokenId, uri)).to.be.reverted;
  // });

  // // Test Case
  // it("Contract Owner owns NFTPerAthlete quantity of each Athlete after Contract Deployment", async function () {
  //   for (i = 0; i < GameItem.NUM_ATHLETES - 1; i++)
  //     expect(await GameItem.balanceOf(owner.address, i)).to.equal(
  //       await GameItem.getNFTPerAthlete()
  //     );
  // });

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
  // it("Contract Owner cannot send more than NFTPerAthlete Tokens", async function () {
  //   const transferAmount = (await GameItem.getNFTPerAthlete()) + 1;
  //   const tokenId = 0;
  //   //TODO cannot get correct ERROR message to use revertedWith
  //   // expect(GameItem.safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00")).to.be.revertedWith(
  //   //   "Error: VM Exception while processing transaction: reverted with reason string 'ERC1155: insufficient balance for transfer'"
  //   //   );
  //   expect(
  //     GameItem.safeTransferFrom(
  //       owner.address,
  //       addr1.address,
  //       tokenId,
  //       transferAmount,
  //       "0x00"
  //     )
  //   ).to.be.reverted;
  // });

  // Test Case
  // it("Non-Contract Owner addresses cannot send tokens from Contract Owner", async function () {
  //   const transferAmount = 5;
  //   const tokenId = 0;
  //   //TODO cannot get correct ERROR message to use revertedWith
  //   // expect(GameItem.connect(addr1).safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00")).to.be.revertedWith(
  //   //   "Error: VM Exception while processing transaction: reverted with reason string 'ERC1155: caller is not owner nor approved'"
  //   // );
  //   expect(
  //     GameItem.connect(addr1).safeTransferFrom(
  //       owner.address,
  //       addr1.address,
  //       tokenId,
  //       transferAmount,
  //       "0x00"
  //     )
  //   ).to.be.reverted;
  // });

  // -------------- // New test cases (after changing contract for provenance) // -------------- //

  // NOTE FOR TREY: TXN.WAIT() IS ONLY FOR TESTING ON RINKEBY (WAITING FOR TRANSACTION TO BE MINED). DO NOT DELETE!!
  // ^ IF TESTING ON HARDHAT JUST COMMENT OUT

  // Baseline working
  // it("Receives constructor arguments properly", async () => {
  //   const starterPackSize = await GameItem.getNFTPerAthlete();
  //   console.log("Starter pack size is ", starterPackSize);
  //   expect(Number(starterPackSize)).to.equal(10);
  // });

  // Testing chainlink functionality -- calling generateRandomWords() from GameItems contract
  it("Returns a random number", async () => {
    // We need current contract address in consumers so time to wait and do it
    console.log(
      "Waiting a min for you to add this contract to consumer list for VRF..."
    );
    await new Promise((resolve) => setTimeout(resolve, 1000 * 45));

    console.log("Getting the random num now...");
    let txn = await GameItem.generateRandomNum();
    await txn.wait();
    // console.log("Random num: ");
    // console.log(txn);

    // Waiting 60 secs for chainlink to get the random number
    // await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
  });

  // Testing new mint pack functionality with new IDs
  // it("Mints a new pack and gives to address", async () => {
  //   let txn = await GameItem.mintStarterPack();
  //   await txn.wait(); // waiting for txn to mine... we need to do this if testing on rinkeby!
  //   const balance = await GameItem.balanceOf(owner.address, 2); //since athletes would be from (0-2)
  //   expect(balance).to.equal(1);
  // });

  // Testing set starting index functionality
  // it("Sets the starting index", async () => {
  //   let txn = await GameItem.setStartingIndex();
  //   await txn.wait();
  //   const index = await GameItem.startingIndex();
  //   expect(index).to.not.equal(0);
  // });

  // Testing (new) base URI function
  // it("Sets the base URIs for athletes", async () => {
  //   let txn = await GameItem.setStartingIndex();
  //   await txn.wait();
  //   txn = await GameItem.setURIs();
  //   await txn.wait();
  // });

  // it("Generates the 'magic number' correctly when starting indices array hasn't been set", async () => {
  //   let txn = await GameItem.setStartingIndex();
  //   // await txn.wait();
  //   let num = await GameItem.randomPlaceholder();
  //   // await txn.wait();
  //   const randy = await GameItem.pseudoRandomNumber();
  //   console.log(randy);
  // });

  // it("Generates 5 random indices for the starter pack", async () => {
  //   let txn = await GameItem.setStartingIndex();
  //   // await txn.wait();
  //   txn = await GameItem.generateStarterPackIndices();
  //   // await txn.wait();

  //   const indices = await GameItem.getStarterPackIndices();
  //   console.log("Indices:");
  //   console.log(indices);
  //   expect(indices.length).to.equal(5);
  // });

  // Testing burn pack functionality and minting with 3 random athletes
  // it("Burns a pack successfully and mints 3 athletes in a random order", async () => {
  //   let txn = await GameItem.setStartingIndex();
  //   await txn.wait();
  //   txn = await GameItem.setURIs();
  //   await txn.wait();
  //   txn = await GameItem.mintStarterPack();
  //   await txn.wait();
  //   txn = await GameItem.burnStarterPack();
  //   await txn.wait();

  //   const indices = await GameItem.getStarterPackIndices();
  //   console.log("Indices are ", indices);

  //   const uri1 = await GameItem.uri(Number(indices[0]));
  //   const uri2 = await GameItem.uri(Number(indices[1]));
  //   const uri3 = await GameItem.uri(Number(indices[2]));
  //   const uri4 = await GameItem.uri(Number(indices[3]));
  //   const uri5 = await GameItem.uri(Number(indices[4]));

  //   //Check URI #s a couple times to make sure ordering was randomized
  //   console.log("\n");
  //   console.log("URI of first minted athlete: ", uri1);
  //   console.log("URI of second minted athlete: ", uri2);
  //   console.log("URI of third minted athlete: ", uri3);
  //   console.log("URI of fourth minted athlete: ", uri4);
  //   console.log("URI of fifth minted athlete: ", uri5);

  //   console.log("\n");
  // });
});
