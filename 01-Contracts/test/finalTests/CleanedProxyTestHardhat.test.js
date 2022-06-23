// New test file where I'm making it simple...... old one was getting a bit cluttered
// Note: This test should be run on hardhat network (tailored to that)
// Again: Do NOT run on Rinkeby as it will not work

// GENERAL FLOW OF THIS TEST FILE:
// Pre proxy testing: Deploy a GameItems contract and mint/burn starter packs for owner and addr1

// 1. Testing to make sure a proxy is setup correctly

// 2. Testing out league join flow -- make sure user can join, staking works correctly
//      For now testing all on hardhat so using test USDC, will eventually use polygon USDC address

// 3. Testing out proxy wide functions (what used to be in LeagueMaker) -- making sure the owner of LeagueMaker can call
//      These will be the functions called from the backend, so need to make sure they work in hardhat tests first
//      setting league schedules for all proxies
//      lockLeagueLineups & unlockLeagueLIneups for all proxies
//      evaluateWeek for all proxies -- note: will test this in step 4

// 4. Testing out evaluating match flow.
//      1. Users can set their lineups correctly (requires are all working, can't set duplicates etc.)
//      2. Evaluate Match in the specific proxy works and updates the mappings (if not working in proxy, def wono't work in leaguemaker)
//      3. EvaluateWeekForAllLeagues() correctly evaluates the match and updates the mappings (this isn't working right now)

require("dotenv").config();
const { expect } = require("chai");
// Adding new testing library, bc chai error assertion is not working for me
const { ethers } = require("hardhat");

const LeagueOfLegendsLogicJSON = require("../../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
const constructorArgs = require("../../constructorArgs"); // GameItems constructor arguments

// IMPORTANT NOTE: You need to SET manual gas in hardhat config for this test to run correctly
// ALSO NOTE: STAKING TESTS WILL NOT WORK ON RINKEBY BC ADD=R1 WILL BE UNDEFINED (need to test on etherscan)
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
    console.log(
      "Athletes Contract Deployed to: " + AthletesContractInstance.address
    );

    //Create League Maker Instance (no library needed anymore)
    LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");
    LeagueMakerInstance = await LeagueMakerFactory.deploy(
      LeagueOfLegendsLogicInstance.address
      // Don't pass these in anymore... when I was trying to initialize as immutable
      // AthletesContractInstance.address,
      // GameItemsInstance.address
    );
    await LeagueMakerInstance.deployed();
    console.log("LeageMaker deployed to:", LeagueMakerInstance.address);

    // Need to prompt approval before making the league (happens after u click "create new league" button on frontend)
    let approval = await testUsdcContract.approve(
      LeagueMakerInstance.address,
      10
    ); // Insert whatever stake amount they specify
    await approval.wait();

    // Making the new proxy league
    var txn = await LeagueMakerInstance.connect(owner).createLeague(
      "best league", // League name
      10, // Stake amount
      false, // Is public
      owner.address, // Admin for league proxy - actually don't need to pass this in bc is msg.sender...
      testUsdcContract.address, // Test USDC address -- when deploying to mainnet won't need this
      AthletesContractInstance.address, // Address of our athletes storage contract
      GameItemInstance.address, // GameItems contract address
      [] //Whitelisted users
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

  // Pre proxy tests: Testing GameItems.sol flow
  it("Doesnt let a nonwhitelisted user mint a starter pack", async () => {
    GameItemInstance.connect(owner);
    let txn = await GameItemInstance.setStartingIndex();
    txn = await GameItemInstance.setURIs(); // This takes awhile

    // Opening private sale & set packs ready to open so owner can open
    txn = await GameItemInstance.openPublicSale();
    await txn.wait();
    txn = await GameItemInstance.allowStarterPacks();
    await txn.wait();

    txn = await GameItemInstance.connect(owner).addUsersToWhitelist([
      owner.address,
      addr1.address,
    ]);

    // Whitelist should now have 2 users
    expect(Number(await GameItemInstance.getNumWhitelisted())).to.equal(2);
    expect(await GameItemInstance.whitelist(owner.address)).to.equal(true);
    expect(await GameItemInstance.whitelist(addr1.address)).to.equal(true);
  });

  // Testing to see if 5 athletes are minted to owner with correct metadata
  it("Burns a pack successfully for owner and mints 5 athletes in a random order", async () => {
    txn = await GameItemInstance.connect(owner).mintStarterPack();
    txn = await GameItemInstance.connect(owner).burnStarterPack();
    txn = await GameItemInstance.connect(addr1).mintStarterPack();
    txn = await GameItemInstance.connect(addr1).burnStarterPack();

    // Making sure owner and addr1 have 5 athletes each, and adding to athletes ID array
    // ATHLETE ARRAYS TO BE USED IN EVAL MATCH TESTS
    ownerAthletes = [];
    addr1Athletes = [];
    for (let i = 0; i < 50; i++) {
      const currNumOwner = Number(
        await GameItemInstance.connect(owner).balanceOf(owner.address, i)
      );
      const currNumAddr1 = Number(
        await GameItemInstance.connect(addr1).balanceOf(addr1.address, i)
      );
      // Adding athlete IDs to arrays for users
      if (currNumOwner === 1) {
        ownerAthletes.push(i);
      }
      if (currNumAddr1 === 1) {
        addr1Athletes.push(i);
      }
    }
    // Amount of athletes they have should equal the starter pack size (5)
    expect(ownerAthletes.length).to.equal(5);
    expect(addr1Athletes.length).to.equal(5);
    console.log("Owner's athletes are ", ownerAthletes);
    console.log("Addr1's athletes are ", addr1Athletes);
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
    const admin = await proxyContract.getAdmin();
    expect(admin).to.equal(owner.address);
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

    // Sender should now have 20 (test) USDC, owner has 70, contract has 10
    expect(Number(await testUsdcContract.balanceOf(addr1.address))).to.equal(
      20
    );
    expect(Number(await testUsdcContract.balanceOf(owner.address))).to.equal(
      80
    );
  });

  it("Successfully lets a user (addr1) with enough TestUSDC join the league ", async () => {
    // Owner gotta join the league now too -- on frontend gotta make sure we prompt approval somewhere!
    let approval = await testUsdcContract
      .connect(owner)
      .approve(proxyContract.address, 10);
    await approval.wait();
    let join = await proxyContract.connect(owner).joinLeague();
    await join.wait();

    // The admin (owner) adding addr1 to whitelist
    const addToWhitelist = await proxyContract
      .connect(owner)
      .addUserToWhitelist(addr1.address);
    await addToWhitelist.wait();

    // Expect user not to be able to join the league before approval...
    expect(proxyContract.connect(addr1).joinLeague()).to.be.revertedWith(
      "Insufficent funds for staking"
    );

    // Prompting approval for addr1
    approval = await testUsdcContract
      .connect(addr1)
      .approve(proxyContract.address, 10);
    await approval.wait();

    console.log(
      "Balance of contract before addr1 joins ",
      Number(await testUsdcContract.balanceOf(proxyContract.address))
    );

    // Addr1 joining the league and staking the 10 USDC
    join = await proxyContract.connect(addr1).joinLeague();
    await join.wait();

    // Proxy contract balance and user balance should be updated
    expect(
      Number(await testUsdcContract.balanceOf(proxyContract.address))
    ).to.equal(20); // Proxy creator stake + addr1 stake
    expect(Number(await testUsdcContract.balanceOf(addr1.address))).to.equal(
      // 20-10
      10
    );
  });

  // TODO: Write test
  it("Successfully lets users join league for free with a public league (no whitelist)", async () => {
    // Making the new proxy league
    let txn = await LeagueMakerInstance.connect(owner).createLeague(
      "Public league test", // League name
      0, // Stake amount
      true, // Is public
      owner.address, // Admin for league proxy - actually don't need to pass this in bc is msg.sender...
      testUsdcContract.address, // USDC address -- when deploying to mainnet we will pass in MATIC instead
      AthletesContractInstance.address, // Address of our athletes storage contract
      GameItemInstance.address, // GameItems contract address
      [] //Whitelisted users
    );
    let leagueProxyContractAddress2;
    receipt = await txn.wait();
    for (const event of receipt.events) {
      if (event.event != null) {
        leagueProxyContractAddress2 = event.args[1];
      }
    }
    console.log("League proxy deployed to:", leagueProxyContractAddress2);

    LeagueProxyInstance2 = new ethers.Contract(
      leagueProxyContractAddress2,
      LeagueOfLegendsLogicJSON.abi,
      provider
    );
    LeagueProxyInstance2.connect(owner);

    // Let's users join league
    console.log("Owner and addr1 about to join the league");
    join = await LeagueProxyInstance2.connect(owner).joinLeague();
    await join.wait();
    join = await LeagueProxyInstance2.connect(addr1).joinLeague();
    await join.wait();
    console.log("Owner and addr1 joined the public league!");
  });

  it("Has two league members in the league", async () => {
    expect(Number(await proxyContract.getLeagueMembersLength())).to.equal(2);
  });

  // NOTE: Now the league has owner and addr1 in it, with a total staked amount of 20
  // Owner stakes their currency when they call createLeague(), and addr1 stakes when they joinLeague()

  // 3. Testing out LeagueMaker functions -- AKA functions executed for all proxies at once -- changed structure (not in LeagueMaker anymore)
  it("Makes sure schedules aren't set before calling the function", async () => {
    let schedule = await proxyContract.getScheduleForWeek(0); // Number of players in schedule
    expect(schedule.length).to.equal(0); // Schedule shouldn't be set yet
  });

  it("Sets league schedules for all proxies AND UPDATES STATE", async () => {
    let currLeague;
    let txn;
    for (let i = 0; i < AllLeagueInstances.length; i++) {
      currLeague = AllLeagueInstances[i].connect(owner);
      txn = await currLeague.setLeagueSchedule();
    }

    // Checking state for a proxy to see if above ^ worked
    let schedule = await proxyContract.getScheduleForWeek(0);
    const players = schedule[0][0]; // Number of players in schedule
    // Since we've added 2 players, should have this for the schedule
    expect(players.length).to.equal(2);

    // Making sure the schedule is set for 8 weeks (weeks 0-7)
    for (let i = 0; i < 8; i++) {
      let schedule = await proxyContract.getScheduleForWeek(i);
      const players = schedule[0][0]; // Number of players in schedule
      expect(players.length).to.equal(2);
    }
  });

  // For testing purposes to see schedule formatting
  it("Logs the schedule info for testing", async () => {
    let schedule = await proxyContract.getScheduleForWeek(0);
    console.log("Full schedule for week 0 is: ", schedule);
  });

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

  // Figured out why expects aren't working.. in hardhat want to await before expect and not in it for revertions (can explain more if you ask me @henry)
  it("Doesn't let non-teamdiff wallet call onlyTeamDiff functions in LeagueOfLegendsLogic", async () => {
    const sampleProxy = AllLeagueInstances[0].connect(addr1); // addr1 is not owner
    await expect(sampleProxy.lockLineup()).to.be.revertedWith(
      "Caller is not TeamDiff"
    );
  });

  // 4. Testing out evaluate match flow
  // NOTE: OWNER AND ADDR1 MINTED STARTER PACKS ABOVE: ARRAYS OF THE ATHLETE IDS ARE: "ownerAthletes" and "addr1Athletes"
  // Temporarily putting this test out since I commented out require
  it("User cannot set lineup of athleteIds that they don't own", async () => {
    const athleteIds = [1, 2, 3, 4, 5]; // Athlete IDs for user 1 (owner)
    let txn;
    for (let i = 0; i < athleteIds.length; i++) {
      if (!addr1Athletes.includes(athleteIds[i])) {
        txn = proxyContract.connect(addr1).setAthleteInLineup(athleteIds[i], i);
        expect(txn).to.be.revertedWith("Caller does not own given athleteIds");
      }
    }
  });

  it("Doesn't let a user that's not in the league set a lineup", async () => {
    const athleteIds = [1, 2, 3, 4, 5];
    let txn;
    for (let i = 0; i < athleteIds.length; i++) {
      txn = proxyContract.connect(addr3).setAthleteInLineup(athleteIds[i], i);
      await expect(txn).to.be.revertedWith("User is not in League.");
    }
  });

  it("User cannot set lineup if line up is locked for the week", async () => {
    const athleteIds = [1, 11, 21, 31, 49]; // Athlete IDs for user 1 (owner)
    let txn = await proxyContract.connect(owner).lockLineup();
    txn = proxyContract.connect(addr1).setAthleteInLineup(athleteIds[0], 0);
    await expect(txn).to.be.revertedWith("lineup is locked for the week!");
    await proxyContract.connect(owner).unlockLineup();
  });

  // Delete this test when we comment out evaluateMatch in LeagueProxy
  // Correctly evaluates the matchup between two users
  // Simulates what we'll be doing from our backend after we pull API data
  it("Correctly appends stats for athletes for week 0", async () => {
    // Adding random stats for 50 athletes
    for (let i = 0; i < 50; i++) {
      const randomNum = Math.floor(Math.random() * 5 + 1); // In range (1,5)
      let txn = await AthletesContractInstance.connect(owner).appendStats(
        i, // Index of athlete
        randomNum, // Random score
        0 // Week num 0
      );
      await txn.wait();
    }

    statsArr = [];
    for (let i = 0; i < 50; i++) {
      const athleteStats = await AthletesContractInstance.getAthleteScores(i);
      statsArr.push(athleteStats[0]);
    }

    expect(statsArr.length).to.equal(50);
    // Comment out below to see stats arr (is being updated correctly right now!)
    console.log("Athlete stats ", statsArr);

    // Creating points arrays to test out evaluateMatch functions
    const athleteStatsNums = statsArr.map((stat) => Number(stat)); // Stats for WEEK 0!
    // Arrays for owner and addr1 points (lineup & lineup2)
    const ownerPointsArr = ownerAthletes.map(
      (athlete) => athleteStatsNums[athlete]
    );
    console.log("owner athlete scores: ", ownerPointsArr);
    const addr1PointsArr = addr1Athletes.map(
      (athlete) => athleteStatsNums[athlete]
    );
    console.log("addr1 athlete scores: ", addr1PointsArr);

    // Finally, total points for owner and addr1. Setting this so we can see if evaluateMatches function in MOBALogicLibrary is working correctly
    ownerPoints = 0;
    addr1Points = 0;
    for (let i = 0; i < ownerPointsArr.length; i++) {
      if (ownerPointsArr[i] > addr1PointsArr[i]) ownerPoints++;
      else if (addr1PointsArr[i] > ownerPointsArr[i]) addr1Points++;
    }
    console.log(
      "The total points for owner and addr1 calculated in test (before evaluateMatches): "
    );
    console.log("[Owner: ", ownerPoints, "], [Addr1: ", addr1Points, "]");
  });

  // Making sure the new function works, also necessary so we can have a series of matches
  it("Sets athletes lineups successfully with the new function (it's setAthleteInLineup() now)", async () => {
    console.log("Setting lineups...");
    for (let i = 0; i < ownerAthletes.length; i++) {
      let txn = await proxyContract.connect(owner).setAthleteInLineup(
        ownerAthletes[i], // Athlete ID
        Math.floor(ownerAthletes[i] / 10) // Athlete position
      );
      await txn.wait();
      txn = await proxyContract
        .connect(addr1)
        .setAthleteInLineup(
          addr1Athletes[i],
          Math.floor(addr1Athletes[i] / 10)
        );
      await txn.wait();
    }
  });

  // The big kahuna
  // Function in MOBALogic isn't working...
  // TOOD: Current state -- stats are getting pushed to the athletes contract, but they are not getting retrieved in MOBALogicLibrary
  it("Evaluates matches with evaluateMatches() (new function)", async () => {
    console.log("Evaluating matches now...");
    // All possible scenarios for a match
    ownerWins = false;
    addr1Wins = false;
    tie = false;
    byeWeek = false;

    let currLeague;
    let txn;
    for (let i = 0; i < AllLeagueInstances.length; i++) {
      currLeague = AllLeagueInstances[i].connect(owner);
      txn = await currLeague.evaluateMatches();
    }

    // Checking record after matches are evaluated
    const ownerRecord = await proxyContract.getUserRecord(owner.address);
    const addr1Record = await proxyContract.getUserRecord(addr1.address);
    const ownerPointsFromContract = await proxyContract.getUserPoints(
      owner.address
    );
    const addr1PointsFromContract = await proxyContract.getUserPoints(
      addr1.address
    );

    console.log("Records: Note -- 0 = loss, 1 = win, 2 = tie, 3 = bye \n");
    console.log(
      "Owner's record (userToRecord) is ",
      ownerRecord,
      ", addr1's record is ",
      addr1Record
    );
    console.log(
      "Owner's points *from the contract* are ",
      ownerPointsFromContract,
      "addr1 points are ",
      addr1PointsFromContract
    );

    // Making sure mappings are correctly updated
    if (Number(ownerRecord[0]) === 1) {
      ownerWins = true;
      expect(Number(addr1Record[0])).to.equal(0);
      expect(Number(ownerPointsFromContract)).to.equal(2);
      expect(Number(addr1PointsFromContract)).to.equal(0);
    } else if (Number(addr1Record[0]) === 1) {
      addr1Wins = true;
      expect(Number(ownerRecord[0])).to.equal(0);
      expect(Number(ownerPointsFromContract)).to.equal(0);
      expect(Number(addr1PointsFromContract)).to.equal(2);
    }
    // Both should have a tie (2)
    else if (Number(addr1Record[0]) === 2) {
      tie = true;
      expect(Number(ownerRecord[0])).to.equal(2);
      expect(Number(ownerPointsFromContract)).to.equal(1);
      expect(Number(addr1PointsFromContract)).to.equal(1);
    }
    // Both should have a bye (3)
    else if (Number(addr1Record[0]) === 3) {
      byeWeek = true;
      expect(Number(ownerRecord[0])).to.equal(3);
    }
  });

  // Just 2 players so there won't be a bye week in this scenario
  // In this test entire league is basically 1 match, just testing prize pot
  // NOTE: On the frontend, we will listen for the event "leagueEnded" which will signal when the league ends and have the prize pot amount per winner (in case of a tie)
  it("Correctly delegates the prize pot, with tiebraker logic as well", async () => {
    // Contract allowance
    console.log("Getting prize pool");
    const prizePoolAmount = Number(
      await proxyContract.getContractUSDCBalance()
    );
    console.log("Prize pool amount in test is ", prizePoolAmount);
    let approval = await testUsdcContract
      .connect(owner)
      .approve(proxyContract.address, prizePoolAmount);
    await approval.wait();

    // League ending
    const endLeague = await proxyContract.connect(owner).onLeagueEnd();

    // Making sure balances are correct
    const oldOwnerBalance = Number(
      await testUsdcContract.balanceOf(owner.address)
    );
    const oldAddr1Balance = Number(
      await testUsdcContract.balanceOf(addr1.address)
    );
    if (ownerWins) {
      // Owner gets entire pot
      expect(
        Number(await testUsdcContract.balanceOf(owner.address)) -
          oldOwnerBalance ==
          prizePoolAmount
      );
    }
    if (addr1Wins) {
      // Addr1 gets entire pot
      expect(
        Number(await testUsdcContract.balanceOf(addr1.address)) -
          oldAddr1Balance ==
          prizePoolAmount
      );
    }
    if (tie) {
      // Pot is split 50/50 in case of a tie
      expect(
        Number(await testUsdcContract.balanceOf(owner.address)) -
          oldOwnerBalance ==
          prizePoolAmount / 2
      );
      expect(
        Number(await testUsdcContract.balanceOf(addr1.address)) -
          oldAddr1Balance ==
          prizePoolAmount / 2
      );
    }
  });

  // Doing a full 8 week test with a league of x members, making sure everything works as planned and prize pot is given out
  // Probably going to do this in a separate test
  it("Now simulating an 8 week split and giving out prize pot", async () => {});
});
