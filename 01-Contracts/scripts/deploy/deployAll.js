const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
const fs = require('fs');

const main = async () => {
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
  textData += "exports.MOBALogicLibrary = \'" + MOBALogicLibraryInstance.address + "\';\n";

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
  textData += "exports.LeagueMakerLibrary = \'" + LeagueMakerLibraryInstance.address + "\';\n";


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
  textData += "exports.LeagueOfLegendsLogic = \'" + LeagueOfLegendsLogicInstance.address + "\';\n";


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
  textData += "exports.LeagueMaker = \'" + LeagueMakerInstance.address + "\';\n";


  //Create Beacon Instance
  const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
  const BeaconInstance = await BeaconFactory.deploy(
    LeagueOfLegendsLogicInstance.address
  );
  await BeaconInstance.deployed();
  console.log("Beacon deployed to:", BeaconInstance.address);
  textData += "exports.Beacon = \'" + BeaconInstance.address + "\';\n";

  //Signers
  [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

  // Deploying test USDC contract
  TestUSDCContractFactory = await hre.ethers.getContractFactory("TestUSDC");
  testUsdcContract = await TestUSDCContractFactory.deploy(); // Setting supply as 100
  await testUsdcContract.deployed();
  testUsdcContract.connect(owner);
  console.log("Test USDC Deployed to: " + testUsdcContract.address);
  textData += "exports.TestUSDC = \'" + testUsdcContract.address + "\';\n";

  // Deploying athletes contract
  AthletesContractFactory = await hre.ethers.getContractFactory("Athletes");
  AthletesContractInstance = await AthletesContractFactory.deploy(); // Setting supply as 100
  await AthletesContractInstance.deployed();
  AthletesContractInstance.connect(owner);
  console.log("Athletes USDC Deployed to: " + AthletesContractInstance.address);
  textData += "exports.Athletes = \'" + AthletesContractInstance.address + "\';\n";
  
  //Adding polygonUSDC and rinkebyUSDC to contract addresses file
  textData += "exports.polygonUSDCAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';" + // When we deploy to mainnet
  "\nexports.rinkebyUSDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';";
  
  
  // Write data in 'Output.txt' .
  fs.writeFileSync('../02-DApp/backend/contractscripts/contract_info/contractAddresses.js', textData, (err) => {
    // In case of a error throw err.
    if (err) {
      console.log("bad");
      throw err;
    };
    console.log("done writing to file");

  })

  //Note this isn't tested but should work
  let contractNames = ['LeagueMaker', 'LeagueOfLegendsLogic']
  contractNames.forEach((contractName) => {
    path = "./build/contracts/contracts/" + contractName + ".sol/" + contractName + ".json";
    readFile(path).then(function (results) {
      return writeFile(path, results)
    }).then(function () {
      //done writing file, can do other things
    })
  })

};

//https://stackoverflow.com/questions/17645478/node-js-how-to-read-a-file-and-then-write-the-same-file-with-two-separate-functi
function readFile (srcPath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(srcPath, 'utf8', function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function writeFile (savPath, data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(savPath, data, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const runMain = async () => {
  try {
    await main();
    fs.writeFileSync('testing.js', "test")

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();

//Latest contract address (rinkeby) --> 0x94b90ca07014F8B67A6bCa8b1b7313d5fD8D2160 (created 2/10 4pm)
