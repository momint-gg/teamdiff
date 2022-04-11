const { ethers, upgrades } = require("hardhat");
var Web3 = require("web3");
const web3 = new Web3("https://cloudflare-eth.com");
// const LeagueBeaconProxyJSON = require("../build/contracts/contracts/LeagueBeaconProxy.sol/LeagueBeaconProxy.json");
const GameLogicJSON = require("../build/contracts/contracts/GameLogic.sol/GameLogic.json");

//01-Contracts\build\contracts\contracts\LeagueBeaconProxy.sol\LeagueBeaconProxy.json

async function main() {
  // Deploying

  //Create Game Logic Instance
  const GameLogicFactory = await ethers.getContractFactory("GameLogic");
  const GameLogicInstance = await GameLogicFactory.deploy();
  await GameLogicInstance.deployed();
  console.log("GameLogic deployed to:", GameLogicInstance.address);

  //Create League Maker INstance
  const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");
  const LeagueMakerInstance = await LeagueMakerFactory.deploy(
    GameLogicInstance.address
  );
  await LeagueMakerInstance.deployed();
  console.log("LeageMaker deployed to:", LeagueMakerInstance.address);

  //Create Beacon Instance
  const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
  const BeaconInstance = await BeaconFactory.deploy(GameLogicInstance.address);
  await BeaconInstance.deployed();
  console.log("Beacon deployed to:", BeaconInstance.address);

  //Signers
  [owner, addr1, addr2, addr3, addr4, addr5, addr6] =
    await hre.ethers.getSigners();

  /******************/
  /***TESTING *******/
  /******************/

  //Create two league proxy instances
  var txn = await LeagueMakerInstance.createLeague("best league", 10, true);
  var leagueProxyContractAddress;
  receipt = await txn.wait();
  for (const event of receipt.events) {
    if (event.event != null) {
      console.log(`Event ${event.event} with args ${event.args}`);
      leagueProxyContractAddress = event.args[1];
    }
  }

  txn = await LeagueMakerInstance.createLeague("league #2", 10, false);
  var leagueProxyContractAddress2;
  receipt = await txn.wait();
  for (const event of receipt.events) {
    if (event.event != null) {
      console.log(`Event ${event.event} with args ${event.args}`);
      leagueProxyContractAddress2 = event.args[1];
    }
  }

  //Creating a new contract instance wiht the abi and address (must test on rinkeby)
  const provider = new ethers.providers.getDefaultProvider();
  //const provider = new ethers.providers.AlchemyProvider("rinkeby", process.env.ALCHEMY_KEY)
  const LeagueProxyInstance = new ethers.Contract(
      leagueProxyContractAddress,
      GameLogicJSON.abi,
      provider
  );
  //console.log("LeagueProxyStorage: " + JSON.stringify(LeagueMakerInstance.storage(), null, 2));
  const LeagueProxyInstance2 = new ethers.Contract(
    leagueProxyContractAddress2,
    GameLogicJSON.abi,
    provider
);


  //Testing delegate call on leagueProxyInstance
  let LeagueProxyInstanceWithSigner = LeagueProxyInstance.connect(owner);

  txn = await LeagueProxyInstanceWithSigner.incrementVersion({
      gasLimit: 10000000,
      //nonce: nonce || undefined,
  })
  var receipt = await txn.wait();

  txn = await LeagueProxyInstanceWithSigner.incrementVersion({
    gasLimit: 10000000,
    //nonce: nonce || undefined,
  })
  receipt = await txn.wait();

  txn = await LeagueProxyInstanceWithSigner.incrementVersion({
    gasLimit: 10000000,
    //nonce: nonce || undefined,
  })
  receipt = await txn.wait();

  // for (const event of receipt.events) {
  //   if (event.event != null) {
  //     console.log(`Event ${event.event} with args ${event.args}`);
  //     //leagueProxyContractAddress = event.args[1];
  //   }
  // }
  console.log("Done incrementing version! ");
  //NOTE calling the public function variableNAme() on the proxy does not
    //return the state variable correctly. However, using get Methods on the 
    //game logic returns the state correctly :/
    //**********NOTE **********/
    //super weird thing is happening
    //when the order of the state variables is slighlty different than whats in game logic, 
    //all of sudden SOME of these state variable return correct variables
    //But when i copy and paste all the variable over from game logic to league beacon proxy,
    // the below non-getter function calls don't return the correct value. 
  console.log(
    "League Proxy 1 state: " +
      "\n\tVersion: " +
      (await LeagueProxyInstanceWithSigner.version()) +
      // (await LeagueProxyInstanceWithSigner.getVersion()) +
      // "\n\tnumWeeks: " +
      // (await LeagueProxyInstanceWithSigner.numWeeks()) +
      // "\n\tcurrentWeekNum: " +
      // (await LeagueProxyInstanceWithSigner.currentWeekNum()) +
      "\n\tleagueMembers: " +
      (await LeagueProxyInstanceWithSigner.leagueMembers(0)) +
      "\n\tuserRecord: " +
      (await LeagueProxyInstanceWithSigner.userToRecord(owner.address, 0)) +
      // (await LeagueProxyInstanceWithSigner.currentWeekNum()) +
      "\n\tisPublic: " +
      (await LeagueProxyInstanceWithSigner.isPublic()) +
      "\n\tstakeAmount: " +
      (await LeagueProxyInstanceWithSigner.stakeAmount()) +
      "\n\tpolygonUSDCAddress: " +
      (await LeagueProxyInstanceWithSigner.polygonUSDCAddress()) +
      "\n\trinkebyUSDCAddress: " +
      (await LeagueProxyInstanceWithSigner.rinkebyUSDCAddress()) +
      "\n\tleagueName: " +
      (await LeagueProxyInstanceWithSigner.leagueName())
      // (await LeagueProxyInstanceWithSigner.getLeagueName())
  );


  //Contract Number 2

  let LeagueProxyInstance2WithSigner = LeagueProxyInstance2.connect(owner);

  txn = await LeagueProxyInstance2WithSigner.incrementVersion({
      gasLimit: 10000000,
      //nonce: nonce || undefined,
  })
  var receipt = await txn.wait();

  txn = await LeagueProxyInstance2WithSigner.incrementVersion({
    gasLimit: 10000000,
    //nonce: nonce || undefined,
  })
  receipt = await txn.wait();

  // txn = await LeagueProxyInstanceWithSigner.incrementVersion({
  //   gasLimit: 10000000,
  //   //nonce: nonce || undefined,
  // })
  // receipt = await txn.wait();

  // txn = await LeagueProxyInstance.incrementVersion();
  // for (const event of receipt.events) {
  //   if (event.event != null) {
  //     console.log(`Event ${event.event} with args ${event.args}`);
  //     //leagueProxyContractAddress = event.args[1];
  //   }
  // }
  console.log("Done incrementing version on Contract 2! ");


  // //Check the updated state after frontend call
  console.log(
    "League Proxy 2 state: " +
      "\n\tVersion: " +
      (await LeagueProxyInstance2WithSigner.version()) +
      // "\n\tnumWeeks: " +
      // (await LeagueProxyInstance2WithSigner.numWeeks()) +
      // "\n\tcurrentWeekNum: " +
      // (await LeagueProxyInstance2WithSigner.currentWeekNum()) +
      "\n\tleagueMembers: " +
      (await LeagueProxyInstance2WithSigner.leagueMembers(0)) +
      "\n\tisPublic: " +
      (await LeagueProxyInstance2WithSigner.isPublic()) +
      "\n\tstakeAmount: " +
      (await LeagueProxyInstance2WithSigner.stakeAmount()) +
      "\n\tpolygonUSDCAddress: " +
      (await LeagueProxyInstance2WithSigner.polygonUSDCAddress()) +
      "\n\trinkebyUSDCAddress: " +
      (await LeagueProxyInstance2WithSigner.rinkebyUSDCAddress()) +
      "\n\tleagueName: " +
      (await LeagueProxyInstance2WithSigner.leagueName())
  );

  
}

main();
