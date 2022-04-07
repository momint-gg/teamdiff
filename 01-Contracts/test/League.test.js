const { expect } = require("chai");
const hre = require("hardhat");
const League = artifacts.require("League.sol");

describe("League.test", async () => {
  var owner;
  var addr1;
  var contract;

  // Ran before first unit test
  before(async () => {
    LeagueContractFactory = await hre.ethers.getContractFactory("League");
    contract = await LeagueContractFactory.deploy(...[10]); // Setting owner as creator and stake amount of 10
    [owner, addr1] = await hre.ethers.getSigners();
    await contract.deployed();
    contract.connect(owner);
    console.log("Deployed to: " + contract.address);

    // Also deploying an athlet contract
    AthleteContractFactory = await hre.ethers.getContractFactory("Athletes");
    athleteContract = await AthleteContractFactory.deploy();
    [owner, addr1] = await hre.ethers.getSigners();
    await athleteContract.deployed();
    athleteContract.connect(owner);
    console.log("Athlete contract deployed to: " + athleteContract.address);
  });

  // Ran before every unit test
  beforeEach(async () => {});

  // Below test must be run on rinkeby
  it("Allows a user to stake USDC and is receieved by the contract when user joins league", async () => {
    console.log("Start");
    let txn = await contract.connect(owner).joinLeague();
    await txn.wait();
    console.log("Joined league :)");
    const balance = await contract.getUSDCBalance();
  });

  // it("Correctly sets athlete IDs and gets a user's lineup", async () => {
  //   const athleteIds = [0, 1, 3, 5, 7]; // Athlete IDs for user 1 (owner)
  //   const athleteIds2 = [2, 4, 6, 8, 9]; // Athlete IDs for user 2 (addr1)

  //   let txn = await contract.connect(owner).setLineup(athleteIds);
  //   await txn.wait();

  //   txn = await contract.connect(addr1).setLineup(athleteIds2);
  //   await txn.wait();

  //   const lineup = await contract.connect(owner).getLineup(); // Getting the caller's lineup
  //   console.log("Lineup for owner is ", lineup);

  //   await contract.connect(addr1);
  //   const lineup2 = await contract.connect(addr1).getLineup();
  //   console.log("Lineup for addr1 is ", lineup2);
  //   expect(lineup).to.not.equal(lineup2);
  // });

  // // Basically the whole test for league functionality
  // // If this works we chillllllllllin baby
  // it("Correctly evaluates a matchup", async () => {
  //   // First adding stats for first 10 athletes (0-9)
  //   console.log("In test");
  //   for (let i = 0; i < 10; i++) {
  //     const randomNum = Math.floor(Math.random() * 5 + 1); // In range (1,5)
  //     let txn = await athleteContract.connect(owner).appendStats(i, randomNum);
  //     await txn.wait();
  //   }
  //   // Setting address of our athlete contract
  //   let txn = await contract.setAthleteContractAddress(athleteContract.address);
  //   await txn.wait();

  //   txn = await contract.evaluateMatch(owner.address, addr1.address);
  //   await txn.wait();

  //   txn = await contract.connect(owner).getUserTotalPts();
  //   console.log("Weekly pts fow owner ", txn);
  //   txn = await contract.connect(addr1).getUserTotalPts();
  //   console.log("Weekly pts for addr1 ", txn);
  // });
});
