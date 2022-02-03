const { expect } = require("chai");
const { ethers } = require("ethers");
const RandomNumber = artifacts.require("contracts/RandomNumber.sol"); //need to include artifacts

artifacts.require("RandomNumber");

describe("RandomNumber", () => {
  let contract;

  beforeEach(async () => {
    const RandomNumber = await ethers.getContractFactory("RandomNumber");
    contract = await RandomNumber.deploy();
  });

  describe("getRandomNumber", () => {
    it("Should return a random number, ideally in a certain range", async function () {
      await contract.deployed();

      await contract.getRandomNumber();
      const randomRes = contract.randomResult;

      console.log("Random result: ", randomRes);
      expect(randomRes).to.be.not.undefined;
    });
  });
});
