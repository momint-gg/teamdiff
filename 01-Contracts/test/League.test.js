const { expect } = require("chai");
const hre = require("hardhat");

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

  it("Gives owner 10", async () => {
    // Transferring 10 USDC to the sender so they have a balance
    // Approving the transaction (important!) of 10 USDC
    // Any time you want to transfer in an erc20 you NEED to approve the transfer for the sender
    let approval = await usdcContract.connect(owner).approve(owner.address, 10);
    await approval.wait();

    let txn = await usdcContract.transferFrom(owner.address, addr1.address, 10);
    await txn.wait();

    // Sender should now have 10 (test) USDC
    expect(Number(await usdcContract.balanceOf(addr1.address))).to.equal(10);
    expect(Number(await usdcContract.balanceOf(owner.address))).to.equal(90);

    console.log(
      "Balance of user in League.sol ",
      await contract.getUserUSDCBalance()
    );
  });

  // We are testing with TestUSDC (made by me) because there is NO RINKEBY USDC ABI >:(
  it("Allows a user to stake USDC and is receieved by the contract when user joins league", async () => {
    // const rinkebyUSDCToken = new ethers.Contract('0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b', json_file.abi ,owner)

    // Approving the transaction first
    // Passing in the LEAGUE CONTRACT as the first param, amount as the second *** (important)
    // Need to approve spending for the contract, in UI will have metamask popup to approve transaction
    let approval = await usdcContract
      .connect(owner)
      .approve(contract.address, 10);
    await approval.wait();

    let txn = await contract.connect(owner).joinLeagueAndStake();
    await txn.wait();

    const balance = await contract.getUSDCBalance();
    expect(balance).to.equal(10);
  });

  it("Allows another user (addr1) with >= 10 USDC to join the league", async () => {
    let approval = await usdcContract
      .connect(addr1)
      .approve(contract.address, 10);
    await approval.wait();

    let txn = await contract.connect(addr1).joinLeagueAndStake();
    await txn.wait();

    const usersLen = await contract.getUsersLength();
    // Expecting 2 users now in the users array
    expect(Number(usersLen)).to.equal(2);
  });

  it("Correctly sets athlete IDs and gets a user's lineup", async () => {
    const athleteIds = [0, 1, 3, 5, 7]; // Athlete IDs for user 1 (owner)
    const athleteIds2 = [2, 4, 6, 8, 9]; // Athlete IDs for user 2 (addr1)

    let txn = await contract.connect(owner).setLineup(athleteIds);
    await txn.wait();

    txn = await contract.connect(addr1).setLineup(athleteIds2);
    await txn.wait();

    const lineup = await contract.connect(owner).getLineup(); // Getting the caller's lineup
    // console.log("Lineup for owner is ", lineup);
    await contract.connect(addr1);
    const lineup2 = await contract.connect(addr1).getLineup();
    // console.log("Lineup for addr1 is ", lineup2);
    expect(lineup).to.not.equal(lineup2);
  });

  // Basically the whole test for league functionality
  // If this works we chillllllllllin baby
  it("Correctly evaluates a matchup", async () => {
    // First adding stats for first 10 athletes (0-9)
    console.log("In test");
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 5 + 1); // In range (1,5)
      let txn = await athleteContract.connect(owner).appendStats(i, randomNum);
      await txn.wait();
    }
    // Setting address of our athlete contract
    let txn = await contract.setAthleteContractAddress(athleteContract.address);
    await txn.wait();

    txn = await contract.evaluateMatch(owner.address, addr1.address);
    await txn.wait();

    txn = await contract.connect(owner).getUserTotalPts();
    console.log("Weekly pts fow owner ", Number(txn));
    txn = await contract.connect(addr1).getUserTotalPts();
    console.log("Weekly pts for addr1 ", Number(txn));
  });
});
