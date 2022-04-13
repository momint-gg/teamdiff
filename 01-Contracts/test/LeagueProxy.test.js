const { expect } = require("chai");
const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = artifacts.require("LeagueOfLegendsLogic.sol");

describe("League Proxy Tests", async () => {
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
    console.log("LEAGUE PROXY INSTANCE ADDRESS ", leagueProxyContractAddress);

    // The actual League Proxy Instance with the above address ^
    var LeagueProxyInstance = new ethers.Contract(
      leagueProxyContractAddress,
      LeagueOfLegendsLogicJSON.abi,
      rinkebySigner
    );
  });

  it("Successfully calls increment version to see if proxy is setup correctly", async () => {
    const testIncrementVersion = await LeagueProxyInstance.incrementVersion();
    // await testIncrementVersion.wait();
    console.log(testIncrementVersion);
  });
});
