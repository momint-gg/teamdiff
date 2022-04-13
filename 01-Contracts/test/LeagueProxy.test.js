const { expect } = require("chai");
const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");

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

    //Create a league proxy instance
    var txn = await LeagueMakerInstance.createLeague("best league", 10, true);
    var leagueProxyContractAddress;
    receipt = await txn.wait();
    for (const event of receipt.events) {
      if (event.event != null) {
        console.log(`Event ${event.event} with args ${event.args}`);
        leagueProxyContractAddress = event.args[1];
      }
    }
    console.log("League proxy contract address ", leagueProxyContractAddress);

    // The actual League Proxy Instance with the above address ^
    const provider = new ethers.providers.getDefaultProvider();
    LeagueProxyInstance = new ethers.Contract(
      leagueProxyContractAddress,
      LeagueOfLegendsLogicJSON.abi,
      provider
    );
    LeagueProxyInstanceWithSigner = LeagueProxyInstance.connect(owner);
  });

  it("Doesn't break", async () => {
    console.log("Starting tests");
  });

  it("Successfully calls increment version on the league proxy", async () => {
    const testIncrementVersion =
      await LeagueProxyInstanceWithSigner.incrementVersion();
    await testIncrementVersion.wait();
    console.log(testIncrementVersion);
  });

  // TESTING STAKING
  it("Gets the test USDC contract address (so we can prompt approval to spend $)", async () => {
    console.log("Getting TUSDC Address");
  });

  it("Gives the owner 10 Test USDC", async () => {});
  it("Successfully lets a user with enough TestUSDC join the league ", async () => {});
});
