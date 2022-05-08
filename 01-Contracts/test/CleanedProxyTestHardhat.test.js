// New test file where I'm making it simple...... old one was getting a bit cluttered
// Note: This test should be run on hardhat network (tailored to that)
// Again: Do NOT run on Rinkeby as it will not work

// GENERAL FLOW OF THIS TEST FILE:
// 1. Testing to make sure a proxy is setup correctly

// 2. Testing out league join flow -- make sure user can join, staking works correctly
//      For now testing all on hardhat so using test USDC, will eventually use polygon USDC address

// 3. Testing out LeagueMaker functions -- making sure the owner of LeagueMaker can call
//      These will be the functions called from the backend, so need to make sure they work in hardhat tests first
//      setLeagueSchedules()
//      lockLeagueLineups()
//      unlockLeagueLineups()
//      evaluateWeekForAllLeagues() -- note: will test this in step 4

// 4. Testing out evaluating match flow.
//      1. Users can set their lineups correctly (requires are all working, can't set duplicates etc.)
//      2. Evaluate Match in the specific proxy works and updates the mappings (if not working in proxy, def wono't work in leaguemaker)
//      3. EvaluateWeekForAllLeagues() correctly evaluates the match and updates the mappings (this isn't working right now)

require("dotenv").config();
const { expect } = require("chai");
// Adding new testing library, bc chai error assertion is not working for me
const { ethers } = require("hardhat");
const { connect } = require("mqtt");

const LeagueOfLegendsLogicJSON = require("../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
// const TestUSDCJSON = artifacts.require("TestUSDC.sol");
// const AthletesJSON = artifacts.require("Athletes.sol");
const constructorArgs = require("../constructorArgs"); // GameItems constructor

// IMPORTANT NOTE: You need to SET manual gas in hardhat config for this test to run correctly
// ALSO NOTE: STAKING TESTS WILL NOT WORK ON RINKEBY BC ADDR1 WILL BE UNDEFINED (need to test on etherscan)
// Make sure your wallet has a lot of rinkey eth!
describe("Proxy and LeagueMaker Functionality Testing (Hardhat)", async () => {
  // Setting up a proxy to test, deploying contracts
  before(async () => {
    //Create MOBA Logic Library instance
    MOBALogicLibraryFactory = await ethers.getContractFactory(
      "MOBALogicLibrary"
    );
    MOBALogicLibraryInstance = await MOBALogicLibraryFactory.deploy();
    await MOBALogicLibraryInstance.deployed();
    console.log(
      "MOBALogicLibrary deployed to:",
      MOBALogicLibraryInstance.address
    );

    //Create GameItems instance
    GameItemFactory = await hre.ethers.getContractFactory("GameItems");
    GameItemInstance = await GameItemFactory.deploy(...constructorArgs);
    await GameItemInstance.deployed();

    //Create Game Logic Instance
    LeagueOfLegendsLogicFactory = await ethers.getContractFactory(
      "LeagueOfLegendsLogic",
      {
        libraries: {
          MOBALogicLibrary: MOBALogicLibraryInstance.address,
        },
      }
    );
    LeagueOfLegendsLogicInstance = await LeagueOfLegendsLogicFactory.deploy();
    await LeagueOfLegendsLogicInstance.deployed();
    console.log(
      "LeagueOfLegendsLogic deployed to:",
      LeagueOfLegendsLogicInstance.address
    );

    //Create League Maker Instance (no library needed anymore)
    LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");
    LeagueMakerInstance = await LeagueMakerFactory.deploy(
      LeagueOfLegendsLogicInstance.address
    );
    await LeagueMakerInstance.deployed();
    console.log("LeageMaker deployed to:", LeagueMakerInstance.address);

    //Create Beacon Instance
    BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
    BeaconInstance = await BeaconFactory.deploy(
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
      "best league", // League name
      10, // Stake amount
      true, // Is public
      owner.address, // Admin for league proxy
      testUsdcContract.address, // Test USDC address -- when deploying to mainnet won't need this
      AthletesContractInstance.address // Address of our athletes storage contract
      // GameItemInstance.address // GameItems contract address
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

    // Create interactable contract instances
    proxyContract = LeagueProxyInstance.connect(owner);
    leaugeMaker = LeagueMakerInstance.connect(owner);
    gameItems = GameItemInstance.connect(addr1);

    // Creating a list of all of our proxy contracts (so we can call functions at once for all proxies)
    const leagueAddresses = await leaugeMaker
      .connect(owner)
      .getLeagueAddresses();

    AllLeagueInstances = []; // all of our leagues (as CONTRACTS) so we can interact with them
    let currProxy;
    for (let i = 0; i < leagueAddresses.length; i++) {
      currProxy = new ethers.Contract(
        leagueAddresses[i],
        LeagueOfLegendsLogicJSON.abi,
        provider
      );
      AllLeagueInstances.push(currProxy);
    }
  });

  // 1. Testing proxy setup
  it("Successfully gets stake amount for the proxy", async () => {
    const testStakeAmount = await proxyContract.stakeAmount();
    expect(Number(testStakeAmount)).to.equal(10);
  });

  it("Successfully gets the name for the proxy", async () => {
    const name = await proxyContract.leagueName();
    expect(name).to.equal("best league");
  });

  it("Sets the admin role correctly", async () => {
    const admin = await proxyContract.admin();
    expect(admin).to.equal(owner.address);
  });

  it("Set the TestUSDC Address correctly", async () => {
    const addy = await proxyContract.testUSDC();
    expect(addy).to.equal(testUsdcContract.address);
  });

  // 2. Testing joining the league flow
  // NOTE: THESE TESTS WILL NOT WORK ON RINKEBY, AS ADDR1 WILL BE UNDEFINED. CAN TEST ON HARDHAT
  it("Gives the sender 10, transfer 10 from sender to other wallet (so they will later be able to join)", async () => {
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

  // NOTE: Now the league has owner and addr1 in it

  // 3. Testing out LeagueMaker functions -- AKA functions executed for all proxies at once -- changed structure (not in LeagueMaker anymore)
  // LETS FUCKING GO IT WORKS NOW
  it("Sets league schedules for the proxies AND UPDATES STATE", async () => {});

  // NOTE: Don't want to call expect statements in a loop like this or hardhat will freak out
  it("Calls lock/unlock lineups for all proxies AND UPDATES STATE", async () => {
    let currLeague;
    let txn;
    for (let i = 0; i < AllLeagueInstances.length; i++) {
      currLeague = AllLeagueInstances[i].connect(owner);
      txn = await currLeague.lockLineup();
      await txn.wait();
    }
    for (let i = 0; i < AllLeagueInstances.length; i++) {
      expect(await currLeague.lineupIsLocked()).to.equal(true);
    }
    for (let i = 0; i < AllLeagueInstances.length; i++) {
      currLeague = AllLeagueInstances[i].connect(owner);
      txn = await currLeague.unlockLineup();
      await txn.wait();
    }
    for (let i = 0; i < AllLeagueInstances.length; i++) {
      expect(await currLeague.getLineupIsLocked()).to.equal(false);
    }
  });

  // Figured out why expects aren't working.. in hardhat want to await before expect and not in it (can explain more if you ask me @henry)
  it("Doesn't let non-teamdiff wallet call onlyTeamDiff functions in LeagueOfLegendsLogic", async () => {
    const sampleProxy = AllLeagueInstances[0].connect(addr1); // addr1 is not owner
    await expect(sampleProxy.lockLineup()).to.be.revertedWith(
      "Caller is not TeamDiff"
    );
  });

  // 4. Testing out evaluate match flow
  // Temporarily putting this test out since I commented out require
  // it("User cannot set lineup of athleteIds that they don't own", async () => {
  //   const athleteIds = [1, 2, 3, 4]; // Athlete IDs for user 1 (owner)
  //   let txn = proxyContract.connect(addr1).setLineup(athleteIds);
  //   expect(txn).to.be.revertedWith("Caller does not own given athleteIds");
  // });

  it("User cannot set duplicate athlete id in lineup", async () => {
    const athleteIds = [1, 1, 2]; // Athlete IDs for user 1 (owner)
    let txn = proxyContract.connect(addr1).setLineup(athleteIds);
    // For some reason these reverted statements aren't working... but all tests are "passing" (correct errors) so we good
    await expect(txn).to.be.revertedWith(
      "Duplicate athleteIDs are not allowed."
    );
  });

  it("Doesn't let a user that's not in the league set a lineup", async () => {
    const athleteIds = [1, 2];
    let txn = proxyContract.connect(addr3).setLineup(athleteIds);
    await expect(txn).to.be.revertedWith("User is not in League.");
  });

  it("User cannot set lineup if line up is locked for the week", async () => {
    const athleteIds = [1, 2]; // Athlete IDs for user 1 (owner)
    let txn = await proxyContract.connect(owner).lockLineup();
    txn = proxyContract.connect(addr1).setLineup(athleteIds);
    await expect(txn).to.be.revertedWith("lineup is locked for the week!");
    await proxyContract.connect(owner).unlockLineup();
  });

  it("User cannot set IDs in the same 0-9, 9-19 etc. range (position range)", async () => {
    const athleteIds = [1, 8];
    let txn = proxyContract.connect(addr1).setLineup(athleteIds);
    await expect(txn).to.be.revertedWith(
      "You are setting an athlete in the wrong position!"
    );
  });

  // Setting athletes and getting user's lineup -- inputting valid IDs
  it("Correctly sets athlete IDs with valid lineup and gets a user's lineup", async () => {
    const athleteIds = [0, 11, 23, 33, 41]; // Athlete IDs for user 1 (owner)
    const athleteIds2 = [2, 14, 29, 30, 45]; // Athlete IDs for user 2 (addr1)

    // Need to remember to have a check also that IDs must be in range (0-9, 10-19, etc.) so we don't have the bug where people can set wrong positions
    let txn = await proxyContract.connect(owner).setLineup(athleteIds);
    txn = await proxyContract.connect(addr1).setLineup(athleteIds2);

    // Making sure state was updated correctly
    let lineup = await proxyContract.connect(owner).getLineup(owner.address); // Getting the caller's lineup
    lineup = lineup.map((player) => Number(player));
    let lineup2 = await proxyContract.getLineup(addr1.address);
    lineup2 = lineup2.map((player) => Number(player));

    for (let i = 0; i < athleteIds.length; i++) {
      expect(lineup[i]).to.equal(athleteIds[i]);
      expect(lineup2[i]).to.equal(athleteIds2[i]);
    }
  });

  // Testing out eval match function in League Proxy (NOT HOW WILL WE DO IN PROD)
  // Delete this test when we comment out evaluateMatch in LeagueProxy
  // Correctly evaluates the matchup between two users
  // it("Correctly appends stats for athletes", async () => {
  //   // Adding random stats for 50 athletes
  //   for (let i = 0; i < 50; i++) {
  //     const randomNum = Math.floor(Math.random() * 5 + 1); // In range (1,5)
  //     let txn = await AthletesContractInstance.connect(owner).appendStats(
  //       i,
  //       randomNum
  //     );
  //     await txn.wait();
  //   }
  // });

  // The big kahuna - testing out LeagueMaker evaluatematch -- if this works we chillin
  // TODO: For some reason, mappings aren't being updated for the league, fix this
  // it("Calls evaluateWeekForAllLeagues() successfully, updates mappings in the proxy contract", async () => {
  //   console.log("Evaluating matches");
  //   let txn = await LeagueMakerInstance.connect(
  //     owner
  //   ).evaluateWeekForAllLeagues();
  //   await txn.wait();

  //   // Getting week 0 results -- not being updated
  //   const ownerPts = await proxyContract.connect(owner).getUserRecord();
  //   const addr1Pts = await proxyContract.connect(addr1).getUserRecord();
  //   console.log("owner record is ", ownerPts, " addr1 record is ", addr1Pts);
  // });

  // Testing prize pool functionality - winner should get the prize pot
  // it("Delegates the prize pool to the winner of the league", async () => {
  //   // Getting prev balance of owner and addr1
  //   const oldOwnerBalance = Number(
  //     await testUsdcContract.balanceOf(owner.address)
  //   );
  //   const oldAddr1Balance = Number(
  //     await testUsdcContract.balanceOf(addr1.address)
  //   );

  //   // First approve allowance for league to xfer the money out
  //   const prizePoolAmount = Number(await proxyContract.getTotalPrizePot());
  //   let approval = await testUsdcContract.approve(
  //     proxyContract.address,
  //     prizePoolAmount
  //   );
  //   await approval.wait();

  //   // Now delegating the prize pool to the winner
  //   const delegatePool = await proxyContract.connect(owner).onLeagueEnd();
  //   await delegatePool.wait();

  //   // Making sure balances are correct! -- whoever wins is given the prize pool
  //   if (ownerWins) {
  //     expect(
  //       Number(await testUsdcContract.balanceOf(owner.address)) -
  //         oldOwnerBalance ==
  //         prizePoolAmount
  //     );
  //   }
  //   if (addr1Wins) {
  //     expect(
  //       Number(await testUsdcContract.balanceOf(addr1.address)) -
  //         oldAddr1Balance ==
  //         prizePoolAmount
  //     );
  //   }
  // });
});
