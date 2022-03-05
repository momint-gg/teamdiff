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

  //Test case
  // it("newly minted GameItem NFTs have a correctly set uri", async function () {
  //   // MintPack athlete
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
  it("Receives constructor arguments properly", async () => {
    const starterPackSize = await GameItem.getNFTPerAthlete();
    console.log("Starter pack size is ", starterPackSize);
    expect(Number(starterPackSize)).to.equal(10);
  });

  // // Testing chainlink functionality -- calling generateRandomWords() from GameItems contract
  // it("Returns a random number", async () => {
  //   // We need current contract address in consumers so time to wait and do it
  //   console.log(
  //     "Waiting a min for you to set this contract address as owner ^^^"
  //   );
  //   //Waiting 20 mins (need time for testing)
  //   await new Promise((resolve) => setTimeout(resolve, 1000 * 60));

  //   console.log("Getting the random num now...");
  //   let txn = await GameItem.generateRandomNum();
  //   await txn.wait();
  //   console.log("Random num: ");
  //   console.log(txn);

  //   // Waiting 60 secs for chainlink to get the random number
  //   // await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
  // });

  // Testing set starting index functionality
  it("Sets the starting index", async () => {
    let txn = await GameItem.setStartingIndex();
    // await txn.wait();
  });

  // Testing (new) base URI function
  it("Sets the base URIs for athletes", async () => {
    let txn = await GameItem.setStartingIndex();
    // await txn.wait();
    txn = await GameItem.setURIs();
    // await txn.wait();
  });

  it("Generates pseudo random indices", async () => {
    let txn = await GameItem.generateStarterPackIndices();
    // await txn.wait();
    txn = await GameItem.generateBoosterPackIndices();
  });

  // Testing burn pack functionality and minting with 5 random athletes
  it("Burns a pack successfully and mints 5 athletes in a random order", async () => {
    // What we could do on front end (5 random indices)
    // Testing contract
    let txn = await GameItem.setStartingIndex();
    // await txn.wait();
    txn = await GameItem.setURIs();
    // await txn.wait();
    txn = await GameItem.mintStarterPack();
    // await txn.wait();
    txn = await GameItem.burnStarterPack();
    // await txn.wait();
  });
});
