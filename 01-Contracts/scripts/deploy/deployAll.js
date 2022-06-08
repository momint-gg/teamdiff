const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
const fs = require('fs');
const constructorArgs = require("../../constructorArgs");


const main = async () => {
  console.log("deploying...");
  let textData = "";
<<<<<<< HEAD
<<<<<<< HEAD
  // textData +=
  //   "exports.GameItems = '0xdFE4F029E7086a1Eb5616240F4AAc7B964A7874b';\n";

  // Create GameItems Instance
  const gameContractFactory = await hre.ethers.getContractFactory("GameItems");
  // const gameContract = await gameContractFactory.deploy(...constructorArgs);
  const gameContract = await gameContractFactory.deploy(...constructorArgs, {
    //overriding gas bc transaction was stuck
    //gasPrice: 203000000000,
    // gasLimit: 20000000,
  });
  await gameContract.deployed();

  textData += "exports.GameItems = '" + gameContract.address + "';\n";
  // console.log("exports.GameItems = \'" + gameContract.address + "\';\n");

  // //Add users to gameitems whitelist
  // txn = await gameContract.addUserToWhitelist("0x14D8DF624769E6075769a59490319625F50B2B17")
  // await txn.wait();
  // console.log("Added owner to whitelist");
  // gameContract.addUserToWhitelist("0xD926A3ddFBE399386A26B4255533A865AD98f7E3")
  // await txn.wait();
  // console.log("Added user to whitelist");
  // //Initial functions that need to be run
  // console.log("First setting starting index...");
  // txn = await gameContract.setStartingIndex();
  // // txn = await gameContract.setStartingIndex({
  // //   gasLimit: 23000000,
  // //   gasPrice: 100000000
  // // });
  // await txn.wait();
  // console.log("Now setting token URIs...");
  // txn = await gameContract.setURIs();
  // await txn.wait();
=======
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
  // textData += "exports.GameItems = '0xdFE4F029E7086a1Eb5616240F4AAc7B964A7874b';\n";
  
  // Create GameItems Instance
  const gameContractFactory = await hre.ethers.getContractFactory("GameItems");
  // const gameContract = await gameContractFactory.deploy(...constructorArgs);
  const gameContract = await gameContractFactory.deploy(...constructorArgs, {
    //overriding gas bc transaction was stuck
    // gasPrice: 10000000,
    gasLimit: 30000000
  });
  await gameContract.deployed();

  textData += "exports.GameItems = \'" + gameContract.address + "\';\n";
  console.log("exports.GameItems = \'" + gameContract.address + "\';\n");
  
  //Add users to gameitems whitelist
  txn = await gameContract.addUserToWhitelist("0x14D8DF624769E6075769a59490319625F50B2B17")
  await txn.wait();
  console.log("Added Trey to whitelist");
  gameContract.addUserToWhitelist("0xD926A3ddFBE399386A26B4255533A865AD98f7E3")
  await txn.wait();
  console.log("Added Trey2 to whitelist");
  gameContract.addUserToWhitelist("0x69EC014c15baF1C96620B6BA02A391aBaBB9C96b")
  await txn.wait();
  console.log("Added Will to whitelist");
  gameContract.addUserToWhitelist("0xbd478094c0D2511Ac5e8bD214637947149bC210f")
  await txn.wait();
  console.log("Added Katie to whitelist");
  gameContract.addUserToWhitelist("0xC3aaa1a446ED0f2E1c9c0AcC89F47c46F30c8Bf3")
  await txn.wait();
  console.log("Added Reggie to whitelist");
  gameContract.addUserToWhitelist("0x37D1431D5D423d66ad6F369EF1bB0767E71A8400")
  await txn.wait();
  console.log("Added Zach G to whitelist");
  //Initial functions that need to be run
  console.log("First setting starting index...");
  // txn = await gameContract.setStartingIndex();
  txn = await gameContract.setStartingIndex({
    gasLimit: 23000000,
    gasPrice: 100000000
  });
  await txn.wait();
  console.log("Now setting token URIs...");
  txn = await gameContract.setURIs();
  await txn.wait();

  //Set Packs ready for testing
  txn = await gameContract.setPacksReady();
  // txn = await gameContract.setStartingIndex({
  //   gasLimit: 23000000,
  //   gasPrice: 100000000
  // });
  await txn.wait();
  console.log("Now setting packsReady to True");
  

<<<<<<< HEAD
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad

  
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
<<<<<<< HEAD
  textData +=
    "exports.MOBALogicLibrary = '" + MOBALogicLibraryInstance.address + "';\n";

<<<<<<< HEAD
  // Create League Maker Library Instance
  // TODO: Delete this since we don't have LeagueMakerLibrary anymore
  // const LeagueMakerLibraryFactory = await ethers.getContractFactory(
  //   "LeagueMakerLibrary"
  // );
  // const LeagueMakerLibraryInstance = await LeagueMakerLibraryFactory.deploy();
  // await LeagueMakerLibraryInstance.deployed();
  // console.log(
  //   "LeagueMakerLibrary deployed to:",
  //   LeagueMakerLibraryInstance.address
  // );
  // textData += "exports.LeagueMakerLibrary = \'" + LeagueMakerLibraryInstance.address + "\';\n";

=======
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
  textData += "exports.MOBALogicLibrary = \'" + MOBALogicLibraryInstance.address + "\';\n";

>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
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
  const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");

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
  // [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

  // // Deploying test USDC contract
  // TestUSDCContractFactory = await hre.ethers.getContractFactory("TestUSDC");
  // testUsdcContract = await TestUSDCContractFactory.deploy(); // Setting supply as 100
  // await testUsdcContract.deployed();
  // testUsdcContract.connect(owner);
  // console.log("Test USDC Deployed to: " + testUsdcContract.address);
  // textData += "exports.TestUSDC = \'" + testUsdcContract.address + "\';\n";
  textData += "exports.TestUSDC = '0x7Eec3A6940d29514424AAB501A36327929a10A62';\n";

  // Deploying athletes contract
  // AthletesContractFactory = await hre.ethers.getContractFactory("Athletes");
  // AthletesContractInstance = await AthletesContractFactory.deploy(); // Setting supply as 100
  // await AthletesContractInstance.deployed();
  // AthletesContractInstance.connect(owner);
  // console.log("Athletes USDC Deployed to: " + AthletesContractInstance.address);
  // textData += "exports.Athletes = \'" + AthletesContractInstance.address + "\';\n";
  textData += "exports.Athletes = '0xA35Cb8796d9C94fc06aA5f9AB646d97f4F3aD0ef';\n"
  
  //Adding polygonUSDC and rinkebyUSDC to contract addresses file
<<<<<<< HEAD
<<<<<<< HEAD
  textData +=
    "exports.polygonUSDCAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';" + // When we deploy to mainnet
    "\nexports.rinkebyUSDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';";
=======
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad
  textData += "exports.polygonUSDCAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';" + // When we deploy to mainnet
  "\nexports.rinkebyUSDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';";
  
  
  // Write data in 'Output.txt' .
  fs.writeFileSync('../02-DApp/backend/contractscripts/contract_info/contractAddresses.js', textData, (err) => {
    // In case of a error throw err.
    if (err) {
      console.log("bad");
      throw err;
    }
    console.log("done writing to file");
<<<<<<< HEAD
>>>>>>> fdc5de6948a85e3c2a4a1f580a42519b29241625
=======
>>>>>>> 7de5241516b0e35b8dc1ee588fe246d8ad8b9aad

  })

  //This copies the abi from our build folder to a dedicated folder in the backend folder
  let contractNames = ['LeagueMaker', 'LeagueOfLegendsLogic', "GameItems"]
  contractNames.forEach(async (contractName) => {
    srcPath = "./build/contracts/contracts/" + contractName + ".sol/" + contractName + ".json";
    backendPath = "../02-DApp/backend/contractscripts/contract_info/abis/" + contractName + ".json";
    const abiData = fs.readFileSync(srcPath)
    fs.writeFileSync(backendPath, abiData, (err) => {
      // In case of a error throw err.
      if (err) {
        console.log("bad");
        throw err;
      }
      console.log("done writing to file");
  
    })

  })
  
  

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
