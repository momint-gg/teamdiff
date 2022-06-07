const { ethers } = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");
const fs = require("fs");
const constructorArgs = require("../../constructorArgs");

const main = async () => {
  console.log("deploying...");
  let textData = "";
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

  //Signers
  [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

  // Deploying test USDC contract
  const TestUSDCContractFactory = await hre.ethers.getContractFactory(
    "TestUSDC"
  );
  const testUsdcContract = await TestUSDCContractFactory.deploy(); // Setting supply as 100
  await testUsdcContract.deployed();
  testUsdcContract.connect(owner);
  console.log("Test USDC Deployed to: " + testUsdcContract.address);
  textData += "exports.TestUSDC = '" + testUsdcContract.address + "';\n";
  // textData +=
  //   "exports.TestUSDC = '0x7Eec3A6940d29514424AAB501A36327929a10A62';\n";

  // Deploying athletes contract
  const AthletesContractFactory = await hre.ethers.getContractFactory(
    "Athletes"
  );
  const AthletesContractInstance = await AthletesContractFactory.deploy(); // Setting supply as 100
  await AthletesContractInstance.deployed();
  AthletesContractInstance.connect(owner);
  console.log("Athletes Deployed to: " + AthletesContractInstance.address);
  textData +=
    "exports.Athletes = '" + AthletesContractInstance.address + "';\n";
  // textData +=
  //   "exports.Athletes = '0xA35Cb8796d9C94fc06aA5f9AB646d97f4F3aD0ef';\n";

  // Adding a sample proxy to test out proxy functionality
  // Need to prompt approval before making the league (happens after u click "create new league" button on frontend)
  let approval = await testUsdcContract.approve(
    LeagueMakerInstance.address,
    10
  ); // Insert whatever stake amount they specify
  await approval.wait();
  console.log("Approved!");

  // Making the new proxy league
  var txn = await LeagueMakerInstance.connect(owner).createLeague(
    "Test proxy league", // League name
    10, // Stake amount
    true, // Is public
    owner.address, // Admin for league proxy - actually don't need to pass this in bc is msg.sender...
    testUsdcContract.address, // Test USDC address -- when deploying to mainnet won't need this
    AthletesContractInstance.address, // Address of our athletes storage contract
    gameContract.address, // GameItems contract address
    [] //Whitelisted users
  );
  var leagueProxyContractAddress;
  receipt = await txn.wait();
  for (const event of receipt.events) {
    if (event.event != null) {
      leagueProxyContractAddress = event.args[1];
    }
  }
  console.log("Test league proxy deployed to:", leagueProxyContractAddress);

  //Adding polygonUSDC and rinkebyUSDC to contract addresses file
  textData +=
    "exports.polygonUSDCAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';" + // When we deploy to mainnet
    "\nexports.rinkebyUSDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';";

  // Write data in 'Output.txt' .
  fs.writeFileSync(
    "../02-DApp/backend/contractscripts/contract_info/contractAddresses.js",
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
  let contractNames = ["LeagueMaker", "LeagueOfLegendsLogic", "GameItems"];
  contractNames.forEach(async (contractName) => {
    srcPath =
      "./build/contracts/contracts/" +
      contractName +
      ".sol/" +
      contractName +
      ".json";
    backendPath =
      "../02-DApp/backend/contractscripts/contract_info/abis/" +
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

// Deploy a proxy
const makeProxy = async (
  owner,
  testUsdcContract,
  LeagueMakerInstance,
  GameItemInstance,
  AthletesContractInstance,
  proxyName
) => {
  // Need to prompt approval before making the league (happens after u click "create new league" button on frontend)
  let approval = await testUsdcContract.approve(
    LeagueMakerInstance.address,
    10
  ); // Insert whatever stake amount they specify
  await approval.wait();
  console.log("Approved!");

  // Making the new proxy league
  var txn = await LeagueMakerInstance.connect(owner).createLeague(
    "Test proxy league", // League name
    10, // Stake amount
    true, // Is public
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
  const leagueAddresses = await leaugeMaker.connect(owner).getLeagueAddresses();

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
