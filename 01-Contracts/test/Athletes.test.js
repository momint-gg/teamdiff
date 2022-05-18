const { expect } = require("chai");
const hre = require("hardhat");

describe("Athletes.test", async () => {
  var owner;
  var addr1;

  // Ran before first unit test
  before(async () => {
    AthletesContractFactory = await hre.ethers.getContractFactory("Athletes");
    contract = await AthletesContractFactory.deploy();
    [owner, addr1] = await hre.ethers.getSigners();
    await contract.deployed();
    contract.connect(owner);
    console.log("Deployed to: " + contract.address);
  });

  // Ran before every unit test
  beforeEach(async () => {});

  it("Appends week 1 stats successfully for 10 athletes without error", async () => {
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 5 + 1); // In range (1,5)
      let txn = await contract.appendStats(i, randomNum);
      await txn.wait();
    }
  });

  it("Calls getStats successfully", async () => {
    let txn = await contract.getStats();
    await txn.wait();
    const athletes = await contract.getAthletes();
    console.log(athletes);
  });

  it("Appends week 2 stats successfully", async () => {
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 5 + 1);
      let txn = await contract.appendStats(i, randomNum);
      await txn.wait();
    }
  });

  it("Calls getStats again successfully", async () => {
    let txn = await contract.getStats();
    await txn.wait();
    const athletes = await contract.getAthletes();
    console.log(athletes);
  });
});
