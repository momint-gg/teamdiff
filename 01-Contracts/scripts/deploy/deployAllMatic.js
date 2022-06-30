// Deploying to matic and populating MATIC abis and contract addresses
// Should specify network as matic when deploying this

const { ethers } = require("hardhat");
const fs = require("fs");

const main = async () => {
  console.log("deploying...");
  let textData = "";


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
  textData +=
    "exports.MOBALogicLibrary = '" + MOBALogicLibraryInstance.address + "';\n";

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
  textData +=
    "exports.LeagueOfLegendsLogic = '" +
    LeagueOfLegendsLogicInstance.address +
    "';\n";

  //Create League Maker Instance
  const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");

  const LeagueMakerInstance = await LeagueMakerFactory.deploy(
    LeagueOfLegendsLogicInstance.address
  );
  await LeagueMakerInstance.deployed();
  console.log("LeageMaker deployed to:", LeagueMakerInstance.address);
  textData += "exports.LeagueMaker = '" + LeagueMakerInstance.address + "';\n";

  //Create Beacon Instance
  const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
  const BeaconInstance = await BeaconFactory.deploy(
    LeagueOfLegendsLogicInstance.address
  );
  await BeaconInstance.deployed();
  console.log("Beacon deployed to:", BeaconInstance.address);
  textData += "exports.Beacon = '" + BeaconInstance.address + "';\n";

  // Deploying athletes contract
  const AthletesContractFactory = await hre.ethers.getContractFactory("Athletes");
  const AthletesContractInstance = await AthletesContractFactory.deploy(); // Setting supply as 100
  await AthletesContractInstance.deployed();
  console.log("Athletes USDC Deployed to: " + AthletesContractInstance.address);
  textData += "exports.Athletes = \'" + AthletesContractInstance.address + "\';\n";

  //Adding polygonUSDC and rinkebyUSDC to contract addresses file
  textData +=
    "exports.polygonUSDCAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';" + // When we deploy to mainnet
    // "\nexports.rinkebyUSDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';" +
    "\nexports.maticAddress = '0x0000000000000000000000000000000000001010';" + 
    "\nexports.wrappedEthAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';";

  // Write data in 'Output.txt' .
  fs.writeFileSync(
    "../02-DApp/backend/contractscripts/contract_info/maticContractAddresses.js",
    textData,
    (err) => {
      // In case of a error throw err.
      if (err) {
        console.log("bad");
        throw err;
      }
      console.log("done writing to file");
    }
  );

  //This copies the abi from our build folder to a dedicated folder in the backend folder
  let contractNames = ["LeagueMaker", "LeagueOfLegendsLogic", "Athletes", "Whitelist"];
  contractNames.forEach(async (contractName) => {
    srcPath =
      "./build/contracts/contracts/" +
      contractName +
      ".sol/" +
      contractName +
      ".json";
    backendPath =
      "../02-DApp/backend/contractscripts/contract_info/maticAbis/" +
      contractName +
      ".json";
    const abiData = fs.readFileSync(srcPath);
    fs.writeFileSync(backendPath, abiData, (err) => {
      // In case of a error throw err.
      if (err) {
        console.log("bad");
        throw err;
      }
      console.log("done writing to file");
    });
  });
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
