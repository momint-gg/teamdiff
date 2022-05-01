const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");

const main = async () => {
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
  [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

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
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();

//Latest contract address (rinkeby) --> 0x94b90ca07014F8B67A6bCa8b1b7313d5fD8D2160 (created 2/10 4pm)
