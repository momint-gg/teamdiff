const { expect } = require("chai");
const hre = require("hardhat");
const RandomNumber = artifacts.require("contracts/RandomNumber.sol"); //need to include artifacts

describe("RandomNumber", () => {
  let contract;

  beforeEach(async () => {
    const RandomNumber = await hre.ethers.getContractFactory("RandomNumber");
    contract = await RandomNumber.deploy();
  });

  describe("getRandomNumber", () => {
    it("Should return a random number, ideally in a certain range", async function () {
      console.log("Inside get random number");
      await contract.deployed();
      await contract.getRandomNumber();

      const randomRes = contract.randomResult;

      console.log("Random result: ", randomRes);
      expect(randomRes).to.be.not.undefined;
    });
  });
});
