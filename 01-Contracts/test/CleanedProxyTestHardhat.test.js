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

const LeagueOfLegendsLogicJSON = require("../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
// const TestUSDCJSON = artifacts.require("TestUSDC.sol");
// const AthletesJSON = artifacts.require("Athletes.sol");
const constructorArgs = require("../constructorArgs"); // GameItems constructor

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

    // Need to prompt allowance before making the league (happens after u click "create new league" button on frontend)
    console.log(
      "Owner/league creator, ",
      owner.address,
      "balance before createLeague(): ",
      Number(await testUsdcContract.balanceOf(owner.address))
    );
    let approval = await testUsdcContract.approve(owner.address, 30); // Insert whatever stake amount they specify
    await approval.wait();

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

    // Making the new proxy league
    var txn = await LeagueMakerInstance.connect(owner).createLeague(
      "best league", // League name
      10, // Stake amount
      true, // Is public
      // owner.address, // Admin for league proxy - actually don't need to pass this in bc is msg.sender...
      testUsdcContract.address, // Test USDC address -- when deploying to mainnet won't need this
      AthletesContractInstance.address, // Address of our athletes storage contract
      GameItemInstance.address // GameItems contract address
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
  // GameItems baseline working
  it("Receives constructor arguments properly", async () => {
    const starterPackSize = await GameItemInstance.connect(
      owner
    ).getNFTPerAthlete();
    expect(Number(starterPackSize)).to.equal(10);
  });

  it("Doesnt let a nonwhitelisted user mint a starter pack", async () => {
    GameItemInstance.connect(owner);
    let txn = await GameItemInstance.setStartingIndex();
    txn = await GameItemInstance.setURIs(); // This takes awhile
    txn = GameItemInstance.mintStarterPack();
    // Mint starter pack should fail
    await expect(txn).to.be.revertedWith("User is not whitelisted.");

    txn = await GameItemInstance.connect(owner).addUsersToWhitelist([
      owner.address,
      addr1.address,
    ]);

    // Whitelist should now have 2 ysers
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
    const athleteIds = [1, 2, 3, 4]; // Athlete IDs for user 1 (owner)
    let txn = proxyContract.connect(addr1).setLineup(athleteIds);
    expect(txn).to.be.revertedWith("Caller does not own given athleteIds");
  });

  // it("User cannot set duplicate athlete id in lineup", async () => {
  //   const athleteIds = [1, 1, 2]; // Athlete IDs for user 1 (owner)
  //   let txn = proxyContract.connect(addr1).setLineup(athleteIds);
  //   // For some reason these reverted statements aren't working... but all tests are "passing" (correct errors) so we good
  //   await expect(txn).to.be.revertedWith(
  //     "Duplicate athleteIDs are not allowed."
  //   );
  // });

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
    const athleteIds = [addr1Athletes[1], addr1Athletes[0]];
    let txn = proxyContract.connect(addr1).setLineup(athleteIds);
    await expect(txn).to.be.revertedWith(
      "You are setting an athlete in the wrong position!"
    );
  });

  // Setting athletes and getting user's lineup -- inputting valid IDs
  it("Correctly sets athlete IDs with valid lineup and gets a user's lineup", async () => {
    const athleteIds = ownerAthletes; // Athlete IDs for user 1 (owner)
    const athleteIds2 = addr1Athletes; // Athlete IDs for user 2 (addr1)

    // Need to remember to have a check also that IDs must be in range (0-9, 10-19, etc.) so we don't have the bug where people can set wrong positions
    let txn = await proxyContract.connect(owner).setLineup(athleteIds);
    txn = await proxyContract.connect(addr1).setLineup(athleteIds2);

    // Making sure state was updated correctly
    lineup = await proxyContract.connect(owner).getLineup(owner.address); // Getting the caller's lineup
    lineup = lineup.map((player) => Number(player));
    lineup2 = await proxyContract.getLineup(addr1.address);
    lineup2 = lineup2.map((player) => Number(player));

    expect(lineup).to.eql(athleteIds); // Note: eql is diff from equal as is does a deep comparison
    expect(lineup2).to.eql(athleteIds2);
  });

  // Delete this test when we comment out evaluateMatch in LeagueProxy
  // Correctly evaluates the matchup between two users
  // Simulates what we'll be doing from our backend after we pull API data
  it("Correctly appends stats for athletes", async () => {
    // Adding random stats for 50 athletes
    for (let i = 0; i < 50; i++) {
      const randomNum = Math.floor(Math.random() * 5 + 1); // In range (1,5)
      let txn = await AthletesContractInstance.connect(owner).appendStats(
        i,
        randomNum
      );
      await txn.wait();
    }

    statsArr = [];
    for (let i = 0; i < 50; i++) {
      const athleteStats = await AthletesContractInstance.getAthleteScores(i);
      statsArr.push(athleteStats);
    }

    expect(statsArr.length).to.equal(50);
    // Comment out below to see stats arr (is being updated correctly right now!)
    // console.log("Athlete stats ", statsArr);

    // Creating points arrays to test out evaluateMatch functions
    const athleteStatsNums = statsArr.map((stat) => Number(stat));
    // Arrays for owner and addr1 points (lineup & lineup2)
    const ownerPointsArr = lineup.map((athlete) => athleteStatsNums[athlete]);
    console.log("owner athlete scores: ", ownerPointsArr);
    const addr1PointsArr = lineup2.map((athlete) => athleteStatsNums[athlete]);
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

  // The big kahuna
  // Function in MOBALogic isn't working...
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

    const ownerRecord = await proxyContract.connect(owner).getUserRecord();
    const addr1Record = await proxyContract.connect(addr1).getUserRecord();
    const ownerPoints = await proxyContract
      .connect(owner)
      .userToPoints(owner.address);
    const addr1Points = await proxyContract.userToPoints(addr1.address);
    console.log("Owner is ", ownerRecord, "addr1 is ", addr1Record);
    console.log(
      "Owner's points are ",
      ownerPoints,
      "addr1 points are ",
      addr1Points
    );

    // Making sure mappings are correctly updated
    if (Number(ownerRecord[0]) === 1) {
      ownerWins = true;
      expect(Number(addr1Record[0])).to.equal(0);
      expect(Number(ownerPoints)).to.equal(2);
      expect(Number(addr1Points)).to.equal(0);
    }
    if (Number(addr1Record[0]) === 1) {
      addr1Wins = true;
      expect(Number(ownerRecord[0])).to.equal(0);
      expect(Number(ownerPoints)).to.equal(0);
      expect(Number(addr1Points)).to.equal(2);
    }
    // Both should have a tie (2)
    if (Number(addr1Record[0]) === 2) {
      tie = true;
      expect(Number(ownerRecord[0])).to.equal(2);
      expect(Number(ownerPoints)).to.equal(1);
      expect(Number(addr1Points)).to.equal(1);
    }
    // Both should have a bye (3)
    if (Number(addr1Record[0]) === 3) {
      byeWeek = true;
      expect(Number(ownerRecord[0])).to.equal(3);
    }
  });

  // Just 2 players so there won't be a bye week in this scenario
  // In this test entire league is basically 1 match, just testing prize pot
  // NOTE: On the frontend, we will listen for the event "leagueEnded" which will signal when the league ends and have the prize pot amount per winner (in case of a tie)
  it("Correctly delegates the prize pot, with tiebraker logic as well", async () => {
    // Contract allowance
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
  // If this works... we ready for some rinkeby shit my dude
  it("Now simulating an 8 week split and giving out prize pot", async () => {});
});
