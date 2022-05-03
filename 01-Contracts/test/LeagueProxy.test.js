require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
const TestUSDCJSON = artifacts.require("TestUSDC.sol");
const AthletesJSON = artifacts.require("Athletes.sol");
const constructorArgs = require("../constructorArgs");

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

    //Create GameItems instance
    GameItemFactory = await hre.ethers.getContractFactory("GameItems");
    GameItemInstance = await GameItemFactory.deploy(...constructorArgs);
    await GameItemInstance.deployed();

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

    LeagueMakerInstance = await LeagueMakerFactory.deploy(
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

    //Minting athlete to addr1
    // txn = await GameItemInstance.connect(addr1).mintAthlete(1);
    // //txn = await gameItemsContract.mintAthlete(id);
    // await txn.wait();
    // txn = await GameItemInstance.connect(addr1).mintAthlete(2);
    // //txn = await gameItemsContract.mintAthlete(id);
    // await txn.wait();
    // console.log("balance: " + await GameItemInstance.connect(addr1).balanceOf(addr1.address, 1));

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
      // GameItemInstance.address
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
  });

  // MAKING SURE LEAGUE WAS SETUP CORRECTLY
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

  it("Schedule is set correctly", async () => {
    let additionalLeagueMembers = [addr2.address, addr3.address, addr4.address];
    await additionalLeagueMembers.forEach(async (signer, index) => {
      console.log("signer: " + signer + " index: " + index);
      txn = await proxyContract.addUserToLeague(signer);
      receipt = await txn.wait();
      // console.log(
      //   "\n\tleagueMember #" + index + ": " +
      //   (await LeagueProxyInstanceWithSigner.leagueMembers(index + 1))
      // )
    });
    // Now running set league schedule as owner (WORKING NOW)
    let setSchedule = await LeagueMakerInstance.connect(
      owner
    ).setLeagueSchedules();
    await setSchedule.wait();

    // @TREY - we're never going to call it this way are we? Will always be called in leaguemaker right (as above ^)
    // let txn = await proxyContract.setLeagueSchedule({ gasLimit: 30000000 });
    // await txn.wait();
    // for (var i = 0; i < 8; i++) {
    //   txn = await proxyContract.getWeekSchedule(i);
    //   weekSchedule = await txn.wait();
    //   console.log("week: " + JSON.stringify(weekSchedule, null, 2));
    //   weekSchedule.forEach((matchup) => {
    //     expect(matchup[0]).to.not.be.equal(matchup[1]);
    //   });
    // }
  });

  // ##################################
  // ###### Setting Lineup Tests ######
  // ##################################
  // it("User cannot set lineup of athleteIds that they don't own", async () => {
  //   const athleteIds = [1, 2, 3, 4]; // Athlete IDs for user 1 (owner)
  //   let txn = proxyContract.connect(addr1).setLineup(athleteIds);
  //   //await txn.wait();
  //   expect(txn).to.be.revertedWith("Caller does not own given athleteIds");
  // });

  // it("User cannot set duplicate athlete id in lineup", async () => {
  //   const athleteIds = [1, 1, 2]; // Athlete IDs for user 1 (owner)
  //   let txn = proxyContract.connect(addr1).setLineup(athleteIds);
  //   //await txn.wait();
  //   expect(txn).to.be.revertedWith("Duplicate athleteIDs are not allowed.");
  // });

  // it("User cannot set lineup in a league they don't belong to", async () => {
  //   const athleteIds = [0, 1, 3, 5, 7]; // Athlete IDs for user 1 (owner)
  //   let txn = proxyContract.connect(addr3).setLineup(athleteIds);
  //   //await txn.wait();
  //   expect(txn).to.be.revertedWith("user is not in League");
  // });

  // it("User cannot set lineup if line up is locked for the week", async () => {
  //   const athleteIds = [1, 2]; // Athlete IDs for user 1 (owner)
  //   // LeagueMakerInstance is undefined for some reason
  //   // @TREY I fixed this ^, was the way that I set it initially (const isn't global)
  //   // If not working out in future, take out const/let of global var
  //   let txn = leaugeMaker.lockLeagueLineups();
  //   //await txn.wait();
  //   txn = proxyContract.connect(addr1).setLineup(athleteIds);
  //   //await txn.wait();
  //   expect(txn).to.be.revertedWith("lineup is locked for the week!");
  // });

  // it("User cannot set IDs in the same 0-9, 9-19 etc. range (position range)", async () => {
  //   const athleteIds = [1, 8];
  //   let txn = await proxyContract.connect(addr1).setLineup(athleteIds);
  //   await txn.wait();
  //   expect(txn).to.be.revertedWith(
  //     "You are setting an athlete in the wrong position!"
  //   );
  // });

  // Setting athletes and getting user's lineup
  it("Correctly sets athlete IDs and gets a user's lineup", async () => {
    const athleteIds = [0, 11, 23, 33, 40]; // Athlete IDs for user 1 (owner)
    const athleteIds2 = [2, 14, 29, 30, 45]; // Athlete IDs for user 2 (addr1)

    // Need to remember to have a check also that IDs must be in range (0-9, 10-19, etc.) so we don't have the bug where people can set wrong positions
    let txn = await proxyContract.connect(owner).setLineup(athleteIds);
    await txn.wait();

    txn = await proxyContract.connect(addr1).setLineup(athleteIds2);
    await txn.wait();

    // const lineup = await proxyContract
    //   .connect(owner)
    //   .userToLineup(owner.address); // Getting the caller's lineup
    // console.log("Lineup for owner is ", lineup);
    // await proxyContract.connect(addr1);
    // const lineup2 = await proxyContract.userToLineup(addr1.address);
    // console.log("Lineup for addr1 is ", lineup2);
    // expect(lineup).to.not.equal(lineup2);
  });

  // it("User can setLineup of athleteIds of their owned athletes", async () => {
  //   const athleteIds = [1, 2, 3]; // Athlete IDs belonging to addr1
  //   let txn;
  //   // athleteIds.forEach(async (id) => {
  //   //     txn = await gameItems.mintAthlete(id);
  //   //     await txn.wait();
  //   //     console.log("balance in test: " + await GameItemInstance.connect(addr1).balanceOf(addr1, id));
  //   // })

  //   // This is private (u can't call this )
  //   txn = await gameItems.mintAthlete(1);
  //   await txn.wait();
  //   txn = await gameItems.mintAthlete(2);
  //   await txn.wait();
  //   txn = await gameItems.mintAthlete(3);
  //   await txn.wait();

  //   txn = await proxyContract.connect(addr1).setLineup(athleteIds);
  //   await txn.wait();

  //   const lineup2 = await proxyContract.connect(addr1).getLineup();
  //   expect(lineup2[0]).to.equal(athleteIds[0]) &&
  //     expect(lineup2[1]).to.equal(athleteIds[1]);
  // });

  // Correctly evaluates the matchup between two users
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
  });

  it("Calls set");

  //   // Calling evaluateMatch from LeagueOfLegendsLogic
  //   console.log("OWNER ADD", owner.address);
  //   const evalMatch = await proxyContract
  //     .connect(owner)
  //     .evaluateMatch(owner.address, addr1.address);
  //   await evalMatch.wait();
  //   // console.log("Winner of the match is ", evalMatch);
  // });

  // Testing evaluateMatch
  // It's working lets goooooooooooo
  // it("Updates the mappings for owner and addr1 after match is evaluated", async () => {
  //   // Making sure the state variables were updated in LeagueOfLegendsLogic

  //   const ownerPts = await proxyContract.connect(owner).getUserTotalPts();
  //   const addr1Pts = await proxyContract.connect(addr1).getUserTotalPts();
  //   const ownerPtVal = Number(ownerPts);
  //   const addr1PtVal = Number(addr1Pts);

  //   ownerWins = ownerPtVal === 1;
  //   addr1Wins = addr1PtVal === 1;

  //   const ownerRecord = await proxyContract.connect(owner).getUserRecord();
  //   const addr1Record = await proxyContract.connect(addr1).getUserRecord();
  //   const ownerRecordFirstWeek = Number(ownerRecord[0]);
  //   const addr1RecordFirstWeek = Number(addr1Record[0]);

  //   // Making sure the mappings were all updated (total pts, record)
  //   if (addr1Wins) {
  //     // addr 1 wins
  //     expect(addr1PtVal).to.equal(1);
  //     expect(addr1RecordFirstWeek).to.equal(1);
  //   } else {
  //     // owner wins
  //     expect(ownerPtVal).to.equal(1);
  //     expect(ownerRecordFirstWeek).to.equal(1);
  //   }
  // });

  // Testing prize pool functionality
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
