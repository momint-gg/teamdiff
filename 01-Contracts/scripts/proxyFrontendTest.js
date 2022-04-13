const { ethers, upgrades } = require("hardhat");
var Web3 = require("web3");
const web3 = new Web3("https://cloudflare-eth.com");
// const LeagueBeaconProxyJSON = require("../build/contracts/contracts/LeagueBeaconProxy.sol/LeagueBeaconProxy.json");
const LeagueOfLegendsLogicJSON = require("../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");

//01-Contracts\build\contracts\contracts\LeagueBeaconProxy.sol\LeagueBeaconProxy.json

async function main() {
  // Deploying


  //Create MOBA Logic Library instance
  const MOBALogicLibraryFactory = await ethers.getContractFactory("MOBALogicLibrary");
  const MOBALogicLibraryInstance = await MOBALogicLibraryFactory.deploy();
  await MOBALogicLibraryInstance.deployed();
  console.log("MOBALogicLibrary deployed to:", MOBALogicLibraryInstance.address);

  
  //Create Game Logic Instance
  const LeagueOfLegendsLogicFactory = await ethers.getContractFactory("LeagueOfLegendsLogic",{
      libraries: {
        MOBALogicLibrary: MOBALogicLibraryInstance.address,
      }
    });
  const LeagueOfLegendsLogicInstance = await LeagueOfLegendsLogicFactory.deploy();
  await LeagueOfLegendsLogicInstance.deployed();
  console.log("LeagueOfLegendsLogic deployed to:", LeagueOfLegendsLogicInstance.address);

  //Create League Maker INstance
  const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");
  const LeagueMakerInstance = await LeagueMakerFactory.deploy(
    LeagueOfLegendsLogicInstance.address
  );
  await LeagueMakerInstance.deployed();
  console.log("LeageMaker deployed to:", LeagueMakerInstance.address);

  //Create Beacon Instance
  const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
  const BeaconInstance = await BeaconFactory.deploy(LeagueOfLegendsLogicInstance.address);
  await BeaconInstance.deployed();
  console.log("Beacon deployed to:", BeaconInstance.address);

  //create LeagueProxy Factory
  // const LeagueProxyFactory = await ethers.getContractFactory("LeagueBeaconProxy", {
  //   libraries: {
  //     ExampleLib: "0x...",
  //   },
  // });

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
      LeagueOfLegendsLogicJSON.abi,
      provider
  );
  //console.log("LeagueProxyStorage: " + JSON.stringify(LeagueMakerInstance.storage(), null, 2));
  const LeagueProxyInstance2 = new ethers.Contract(
    leagueProxyContractAddress2,
    LeagueOfLegendsLogicJSON.abi,
    provider
);


  //Testing delegate call on leagueProxyInstance
  let LeagueProxyInstanceWithSigner = LeagueProxyInstance.connect(owner);
    /*
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
  */
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
  /*
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
    */

  //Contract Number 2

  // let LeagueProxyInstance2WithSigner = LeagueProxyInstance2.connect(owner);

  // txn = await LeagueProxyInstance2WithSigner.incrementVersion({
  //     gasLimit: 10000000,
  //     //nonce: nonce || undefined,
  // })
  // var receipt = await txn.wait();

  // txn = await LeagueProxyInstance2WithSigner.incrementVersion({
  //   gasLimit: 10000000,
  //   //nonce: nonce || undefined,
  // })
  // receipt = await txn.wait();

  // // txn = await LeagueProxyInstanceWithSigner.incrementVersion({
  // //   gasLimit: 10000000,
  // //   //nonce: nonce || undefined,
  // // })
  // // receipt = await txn.wait();

  // // txn = await LeagueProxyInstance.incrementVersion();
  // // for (const event of receipt.events) {
  // //   if (event.event != null) {
  // //     console.log(`Event ${event.event} with args ${event.args}`);
  // //     //leagueProxyContractAddress = event.args[1];
  // //   }
  // // }
  // console.log("Done incrementing version on Contract 2! ");


  // // //Check the updated state after frontend call
  // console.log(
  //   "League Proxy 2 state: " +
  //     "\n\tVersion: " +
  //     (await LeagueProxyInstance2WithSigner.version()) +
  //     // "\n\tnumWeeks: " +
  //     // (await LeagueProxyInstance2WithSigner.numWeeks()) +
  //     // "\n\tcurrentWeekNum: " +
  //     // (await LeagueProxyInstance2WithSigner.currentWeekNum()) +
  //     "\n\tleagueMembers: " +
  //     (await LeagueProxyInstance2WithSigner.leagueMembers(0)) +
  //     "\n\tisPublic: " +
  //     (await LeagueProxyInstance2WithSigner.isPublic()) +
  //     "\n\tstakeAmount: " +
  //     (await LeagueProxyInstance2WithSigner.stakeAmount()) +
  //     "\n\tpolygonUSDCAddress: " +
  //     (await LeagueProxyInstance2WithSigner.polygonUSDCAddress()) +
  //     "\n\trinkebyUSDCAddress: " +
  //     (await LeagueProxyInstance2WithSigner.rinkebyUSDCAddress()) +
  //     "\n\tleagueName: " +
  //     (await LeagueProxyInstance2WithSigner.leagueName())
  // );

  //Add users to league
  var signers =  [addr1.address, addr2.address, addr3.address];
  await signers.forEach(async (signer, index) => {
    console.log("signer: " + signer + " index: " + index);
    txn = await LeagueProxyInstanceWithSigner.addUserToLeague(
      signer
    );
    receipt = await txn.wait();
    // console.log(
    //   "\n\tleagueMember #" + index + ": " + 
    //   (await LeagueProxyInstanceWithSigner.leagueMembers(index + 1))
    // )
  })
  // .then(async () => {
  //   //Set league schedule
  //   //LeagueProxyInstanceWithSigner = LeagueProxyInstance.connect(LeagueMakerInstance.address);
  //   txn = await LeagueProxyInstanceWithSigner.setLeagueSchedule();
  //   receipt = await txn.wait();
  // })
  // console.log(
  //   "\n\tleagueMember #0: " + 
  //   (await LeagueProxyInstanceWithSigner.leagueMembers(0))
  // )
 

    //Set league schedule
    //LeagueProxyInstanceWithSigner = LeagueProxyInstance.connect(LeagueMakerInstance.address);
    txn = await LeagueProxyInstanceWithSigner.setLeagueSchedule();
        
    // const msgData = web3.eth.abi.encodeFunctionSignature("setLeagueSchedule()");

    // txn = await web3.eth.sendTransaction({
    //   from: LeagueMakerInstance.address,
    //   to: LeagueProxyInstance.address,
    //   //value: 1,     // If you want to send ether with the call.
    //   //gas: 2,       // If you want to specify the gas.
    //   // gasPrice: ???,  // If you want to specify the gas price.
    //   data: msgData
    // }, function(err, transactionHash) {
    //   if (err) { 
    //       console.log(err); 
    //   } else {
    //       console.log(transactionHash);
    //   }
    // });
    receipt = await txn.wait();

  
}

main();
