const chai = require("chai");
const { expect } = require("hardhat");
const hre = require("hardhat");
const GameItems = artifacts.require("contracts/GameItems.sol");

describe("MintPack Test", async () => {
  let owner;
  let addr1;

  beforeEach(async () => {
    const GameItems = await hre.ethers.getContractFactory("GameItems");
    contract = await GameItems.deploy();
    [owner, addr1] = await ethers.getSigners();
    await contract.deployed();
  });

  //Test case
  it("Making sure initial URI func works", async function () {
    const firstUri = await contract.uri(0);
    expect(firstUri).to.equal(
      "https://ipfs.io/ipfs/QmVwNeMaU8AdB7E3UKwKD9FYpXD4vLimv2kQ1fFBMKDFNt/athlete1.json"
    );
    console.log(firstUri);
  });

  it("Should mint a new pack of NFTs with random indexes", async () => {
    await contract.mintPack();
  });
});
