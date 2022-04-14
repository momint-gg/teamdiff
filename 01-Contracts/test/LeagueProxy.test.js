const { expect } = require("chai");
const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
const TestUSDCJSON = artifacts.require("TestUSDC.sol");

// NOTE: For now, proxy tests must be run on rinkeby (hardhat doesn't support yet)
// Make sure youre wallet has a lot of rinkey eth!
describe("LeagueProxy.test", async () => {
  // Setting up a proxy to test, deploying contracts
  before(async () => {
    //Create MOBA Logic Library instance
    const MOBALogicLibraryFactory = await ethers.getContractFactory(
      "MOBALogicLibrary"
    );
    const MOBALogicLibraryInstance = await MOBALogicLibraryFactory.deploy();
    await MOBALogicLibraryInstance.deployed();
    console.log(
      "MOBALogicLibrary deployed to:",
      MOBALogicLibraryInstance.address
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

    //Create League Maker INstance
    const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");
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

    // User creating a league proxy instance
    console.log("User address is ", owner.address);
    var txn = await LeagueMakerInstance.createLeague(
      "best league",
      10,
      true,
      owner.address, // Admin for proxy contract (league)
      testUsdcContract.address
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

  it();
});
