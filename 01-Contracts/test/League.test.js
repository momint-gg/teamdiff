const { expect } = require("chai");
const hre = require("hardhat");
const League = artifacts.require("League.sol");

describe("League.test", async () => {
  var owner;
  var addr1;
  var contract;

  // Ran before first unit test
  before(async () => {
    // Deploying test USDC contract
    TestUSDCContractFactory = await hre.ethers.getContractFactory("TestUSDC");
    usdcContract = await TestUSDCContractFactory.deploy(...[100]); // Setting supply as 100
    [owner, addr1] = await hre.ethers.getSigners();
    await usdcContract.deployed();
    usdcContract.connect(owner);
    console.log("Deployed to: " + usdcContract.address);

    // Deploying league test contract
    LeagueContractFactory = await hre.ethers.getContractFactory("League");
    contract = await LeagueContractFactory.deploy(
      ...[10, usdcContract.address] //Test USDC contract address
    );
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

  // Below tests need to be run on rinkeby
  it("Correctly gets the USDC balance for my wallet", async () => {
    let bal = await contract.getUserUSDCBalance();
    console.log("USDC Balance ", bal);
    expect(Number(bal)).to.equal(0);

    console.log(
      "TUSDC contract balance ",
      Number(await usdcContract.getContractBal())
    );
  });

  it("Deploys a test USDC contract and gives the sender a balance", async () => {
    // Transferring 10 USDC to the sender so they have a balance
    // Approving the transaction (important!) of 10 USDC
    console.log("Approving transaction");
    let approval = await usdcContract.approve(owner.address, 10);
    await approval.wait();
    console.log(approval);

    console.log("About to transfer (test) usdc");
    let txn = await usdcContract.transferToSender();
    await txn.wait();
    // txn = await contract.getUserUSDCBalance();
    // console.log("User balance: ", txn);
  });

  // We are testing with TestUSDC (made by me) because there is NO RINKEBY USDC ABI >:( -- wtf brooooooo
  it("Allows a user to stake USDC and is receieved by the contract when user joins league", async () => {
    console.log("Start");
    // First: Approve the transfer first (will do in metamask normally) -- have to do when on mainnet
    // const rinkebyUSDCToken = new ethers.Contract('0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b', json_file.abi ,owner)

    // Joining the league, staking the 10 USDC
    let txn = await contract.joinLeague();
    await txn.wait();
    console.log("Joined league :)");
    const balance = await contract.getUSDCBalance();
    // console.log("Contract balance is ", Number(balance));
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
