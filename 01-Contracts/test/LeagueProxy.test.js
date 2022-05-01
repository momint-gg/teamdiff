require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
const TestUSDCJSON = artifacts.require("TestUSDC.sol");
const AthletesJSON = artifacts.require("Athletes.sol");

// IMPORTANT NOTE: You need to SET manual gas in hardhat config for this test to run correctly
// ALSO NOTE: STAKING TESTS WILL NOT WORK ON RINKEBY BC ADDR1 WILL BE UNDEFINED (need to test on etherscan)
// Make sure youre wallet has a lot of rinkey eth!
describe("LeagueProxy.test", async () => {
  // Setting up a proxy to test, deploying contracts
  before(async () => {
    //Create MOBA Logic Library instance
    const MOBALogicLibraryFactory = await ethers.getContractFactory(
      "MOBALogicLibrary"
    );
    MOBALogicLibraryInstance = await MOBALogicLibraryFactory.deploy();
    await MOBALogicLibraryInstance.deployed();
    console.log(
      "MOBALogicLibrary deployed to:",
      MOBALogicLibraryInstance.address
    );

    //Create League Maker Library Instance
    const LeagueMakerLibraryFactory = await ethers.getContractFactory(
      "LeagueMakerLibrary"
    );
    const LeagueMakerLibraryInstance = await LeagueMakerLibraryFactory.deploy();
    await LeagueMakerLibraryInstance.deployed();
    console.log(
      "LeagueMakerLibrary deployed to:",
      LeagueMakerLibraryInstance.address
    );

    //Create Game Logic Instance
    const LeagueOfLegendsLogicFactory = await ethers.getContractFactory(
      "LeagueOfLegendsLogic",
      {
        libraries: {
          MOBALogicLibrary: MOBALogicLibraryInstance.address,
        },
      }
    );
    const LeagueOfLegendsLogicInstance =
      await LeagueOfLegendsLogicFactory.deploy();
    await LeagueOfLegendsLogicInstance.deployed();
    console.log(
      "LeagueOfLegendsLogic deployed to:",
      LeagueOfLegendsLogicInstance.address
    );

    //Create League Maker Instance
    const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker", {
      libraries: {
        LeagueMakerLibrary: LeagueMakerLibraryInstance.address,
      },
    });

    const LeagueMakerInstance = await LeagueMakerFactory.deploy(
      LeagueOfLegendsLogicInstance.address
    );
    await LeagueMakerInstance.deployed();
    console.log("LeageMaker deployed to:", LeagueMakerInstance.address);

    //Create Beacon Instance
    const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
    const BeaconInstance = await BeaconFactory.deploy(
      LeagueOfLegendsLogicInstance.address
    );
    await BeaconInstance.deployed();
    console.log("Beacon deployed to:", BeaconInstance.address);

    //Signers
    [owner, addr1, addr2, addr3, addr4, addr5, addr6] =
      await ethers.getSigners();

    // Deploying test USDC contract
    TestUSDCContractFactory = await hre.ethers.getContractFactory("TestUSDC");
    testUsdcContract = await TestUSDCContractFactory.deploy(); // Setting supply as 100
    await testUsdcContract.deployed();
    testUsdcContract.connect(owner);
    console.log("Test USDC Deployed to: " + testUsdcContract.address);

    // Deploying athletes contract
    AthletesContractFactory = await hre.ethers.getContractFactory("Athletes");
    AthletesContractInstance = await AthletesContractFactory.deploy(); // Setting supply as 100
    await AthletesContractInstance.deployed();
    AthletesContractInstance.connect(owner);
    console.log("Test USDC Deployed to: " + AthletesContractInstance.address);

    // User creating a league proxy instance
    console.log("User address is ", owner.address);
    var txn = await LeagueMakerInstance.createLeague(
      "best league",
      10,
      true,
      owner.address, // Admin for proxy contract (league)
      testUsdcContract.address,
      AthletesContractInstance.address
    );
    var leagueProxyContractAddress;
    receipt = await txn.wait();
    for (const event of receipt.events) {
      if (event.event != null) {
        // console.log(`Event ${event.event} with args ${event.args}`);
        leagueProxyContractAddress = event.args[1];
      }
    }
    console.log("League proxy deployed to:", leagueProxyContractAddress);

    // The actual League Proxy Instance with the above address ^
    provider = new ethers.providers.getDefaultProvider();
    LeagueProxyInstance = new ethers.Contract(
      leagueProxyContractAddress,
      LeagueOfLegendsLogicJSON.abi,
      provider
    );
    proxyContract = LeagueProxyInstance.connect(owner);
  });

  // MAKING SURE LEAGUE WAS SETUP CORRECTLY
  it("Successfully gets stake amount for the proxy", async () => {
    const testStakeAmount = await proxyContract.getStakeAmount();

    expect(Number(testStakeAmount)).to.equal(10);
  });

  it("Successfully gets the name for the proxy", async () => {
    const name = await proxyContract.getLeagueName();

    expect(name).to.equal("best league");
  });

  it("Sets the admin role correctly", async () => {
    const admin = await proxyContract.getAdmin();

    expect(admin).to.equal(owner.address);
  });

  it("Set the TestUSDC Address correctly", async () => {
    const addy = await proxyContract.getTestUSDCAddress();

    expect(addy).to.equal(testUsdcContract.address);
  });

  // TESTING STAKING
  // NOTE: THESE TESTS WILL NOT WORK ON RINKEBY, AS ADDR1 WILL BE UNDEFINED. CAN TEST ON HARDHAT
  it("Gives the sender 10, transfer 10 from sender to other wallet", async () => {
    //Since the TestUSDC contract was deployed by LeagueOfLegends.sol, that contract should have the initial balance
    const initialLOLTUSDCBalance = await testUsdcContract.balanceOf(
      owner.address
    );
    expect(Number(initialLOLTUSDCBalance)).to.be.greaterThan(0);

    let approval = await testUsdcContract.approve(owner.address, 20);
    await approval.wait();

    let txn = await testUsdcContract.transferFrom(
      owner.address,
      addr1.address,
      20
    );
    await txn.wait();

    // Sender should now have 20 (test) USDC
    expect(Number(await testUsdcContract.balanceOf(addr1.address))).to.equal(
      20
    );
    expect(Number(await testUsdcContract.balanceOf(owner.address))).to.equal(
      80
    );
  });

  it("Successfully lets a user (addr1) with enough TestUSDC join the league ", async () => {
    // TODO: Add addr1 to whitelist before prompting approval/joining the league
    // Adding addr1 to whitelist so they can join the league

    // The admin (owner) adding addr1 to whitelist
    const addToWhitelist = await proxyContract
      .connect(owner)
      .addUserToWhitelist(addr1.address);
    await addToWhitelist.wait();

    // Prompting approval for addr1
    let approval = await testUsdcContract
      .connect(addr1)
      .approve(proxyContract.address, 10);
    await approval.wait();

    // Addr1 joining the league and staking the 10 USDC
    let join = await proxyContract.connect(addr1).joinLeague();
    await join.wait();

    // Proxy contract balance and user balance should be updated
    expect(
      Number(await testUsdcContract.balanceOf(proxyContract.address))
    ).to.equal(10); // USDC Should be transferred to the league proxy
    expect(Number(await testUsdcContract.balanceOf(addr1.address))).to.equal(
      //20-10
      10
    );
  });

  // Setting athletes and getting user's lineup
  it("Correctly sets athlete IDs and gets a user's lineup", async () => {
    const athleteIds = [0, 1, 3, 5, 7]; // Athlete IDs for user 1 (owner)
    const athleteIds2 = [2, 4, 6, 8, 9]; // Athlete IDs for user 2 (addr1)

    let txn = await proxyContract.connect(owner).setLineup(athleteIds);
    await txn.wait();

    txn = await proxyContract.connect(addr1).setLineup(athleteIds2);
    await txn.wait();

    const lineup = await proxyContract.connect(owner).getLineup(); // Getting the caller's lineup
    // console.log("Lineup for owner is ", lineup);
    await proxyContract.connect(addr1);
    const lineup2 = await proxyContract.connect(addr1).getLineup();
    // console.log("Lineup for addr1 is ", lineup2);
    expect(lineup).to.not.equal(lineup2);
  });

  // Setting what the teamdiff wallet is first
  // const teamDiffWallet = new ethers.Wallet(process.env.PRIVATE_KEY, "hardhat");

  // Correctly evaluates the matchup between two users
  it("Correctly appends stats for athletes and evaluates a matchup", async () => {
    // Adding random stats for first 10 athletes (0-9)
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 5 + 1); // In range (1,5)
      let txn = await AthletesContractInstance.connect(owner).appendStats(
        i,
        randomNum
      );
      await txn.wait();
    }

    // Calling evaluateMatch from LeagueOfLegendsLogic
    console.log("OWNER ADD", owner.address);
    const evalMatch = await proxyContract
      .connect(owner)
      .evaluateMatch(owner.address, addr1.address);
    await evalMatch.wait();
    // console.log("Winner of the match is ", evalMatch);
  });

  // Testing evaluateMatch
  // It's working lets goooooooooooo
  it("Updates the mappings for owner and addr1 after match is evaluated", async () => {
    // Making sure the state variables were updated in LeagueOfLegendsLogic

    const ownerPts = await proxyContract.connect(owner).getUserTotalPts();
    const addr1Pts = await proxyContract.connect(addr1).getUserTotalPts();
    const ownerPtVal = Number(ownerPts);
    const addr1PtVal = Number(addr1Pts);

    ownerWins = ownerPtVal === 1;
    addr1Wins = addr1PtVal === 1;

    const ownerRecord = await proxyContract.connect(owner).getUserRecord();
    const addr1Record = await proxyContract.connect(addr1).getUserRecord();
    const ownerRecordFirstWeek = Number(ownerRecord[0]);
    const addr1RecordFirstWeek = Number(addr1Record[0]);

    // Making sure the mappings were all updated (total pts, record)
    if (addr1Wins) {
      // addr 1 wins
      expect(addr1PtVal).to.equal(1);
      expect(addr1RecordFirstWeek).to.equal(1);
    } else {
      // owner wins
      expect(ownerPtVal).to.equal(1);
      expect(ownerRecordFirstWeek).to.equal(1);
    }
  });

  // Testing prize pool functionality
  it("Delegates the prize pool to the winner of the league", async () => {
    // Getting prev balance of owner and addr1
    const oldOwnerBalance = Number(
      await testUsdcContract.balanceOf(owner.address)
    );
    const oldAddr1Balance = Number(
      await testUsdcContract.balanceOf(addr1.address)
    );

    // First approve allowance for league to xfer the money out
    const prizePoolAmount = Number(await proxyContract.getTotalPrizePot());
    let approval = await testUsdcContract.approve(
      proxyContract.address,
      prizePoolAmount
    );
    await approval.wait();

    // Now delegating the prize pool to the winner
    const delegatePool = await proxyContract.connect(owner).onLeagueEnd();
    await delegatePool.wait();

    // Making sure balances are correct! -- whoever wins is given the prize pool
    if (ownerWins) {
      expect(
        Number(await testUsdcContract.balanceOf(owner.address)) -
          oldOwnerBalance ==
          prizePoolAmount
      );
    }
    if (addr1Wins) {
      expect(
        Number(await testUsdcContract.balanceOf(addr1.address)) -
          oldAddr1Balance ==
          prizePoolAmount
      );
    }
  });
});
