const { ethers, upgrades } = require("hardhat");
var Web3 = require("web3");
const web3 = new Web3("https://cloudflare-eth.com");
const LeagueBeaconProxyJSON = require("../build/contracts/contracts/LeagueBeaconProxy.sol/LeagueBeaconProxy.json");
//01-Contracts\build\contracts\contracts\LeagueBeaconProxy.sol\LeagueBeaconProxy.json

async function main() {
  // Deploying

  //Create GAme Logicr
  const GameLogicFactory = await ethers.getContractFactory("GameLogic");
  const GameLogicInstance = await GameLogicFactory.deploy();
  await GameLogicInstance.deployed();
  console.log("GameLogic deployed to:", GameLogicInstance.address);

  //Create League Maker
  const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");
  const LeagueMakerInstance = await LeagueMakerFactory.deploy(
    GameLogicInstance.address
  );
  await LeagueMakerInstance.deployed();
  console.log("LeageMaker deployed to:", LeagueMakerInstance.address);

  //Create Beacon
  const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
  const BeaconInstance = await BeaconFactory.deploy(GameLogicInstance.address);
  await BeaconInstance.deployed();
  console.log("Beacon deployed to:", BeaconInstance.address);

  //Signers
  [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();

  
  //const LeagueProxyInstance = await LeagueProxyFactory.deploy(BeaconInstance.address, web3.eth.abi.encodeFunctionSignature('initialize(uint256)'));
  // await LeagueProxyInstance.deployed();
  // await LeagueProxyInstance2.deployed();
  var txn = await LeagueMakerInstance.createLeague("new");
  var leagueProxyContractAddress;
  //console.log("txn result: " + txn);
  receipt = await txn.wait();
  for (const event of receipt.events) {
    if (event.event != null) {
      console.log(`Event ${event.event} with args ${event.args}`);
      leagueProxyContractAddress = event.args[1];
    }
  }

  //********** */
  // Testing creatueLEague
  //////////////////
  //TODO Consider creating a contract wiht the abi and address, and sendTransactions to that contract
  //#1
  const LeagueProxyInstance = await hre.ethers.getContractAt("LeagueBeaconProxy", leagueProxyContractAddress);
  
  //#2
  // const MyContract = await ethers.getContractFactory("LeagueBeaconProxy");
  // const LeagueProxyInstance = await MyContract.attach(
  //   leagueProxyContractAddress // The deployed contract address
  // ); 
  
  
  //#3
  //const provider = new ethers.providers.getDefaultProvider();
  // const provider = new ethers.providers.AlchemyProvider("rinkeby", process.env.ALCHEMY_KEY)

  // const LeagueProxyInstance = new ethers.Contract(
  //     leagueProxyContractAddress,
  //     LeagueBeaconProxyJSON.abi,
  //     provider
  // );


  //STILL TRYING TO CALL INCREMENT VERSION FROM FRONT END
  // const msgData = web3.eth.abi.encodeFunctionSignature("incrementVersion()");
  // // const msgData = web3.eth.abi.encodeFunctionSignature("initialize(uint256)",
  // //                                                      1);
  // // const msgData = "0x00";
  // txn = await web3.eth.sendTransaction({
  //   from: 0x0,
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
  txn = await LeagueProxyInstance.incrementVersion();
  console.log(
    "League Proxy init state: " 
      + "\n\tVersion: " + (await LeagueProxyInstance.version())
      + "\n\tnumWeeks: " + (await LeagueProxyInstance.numWeeks())
      + "\n\tleagueName: " + (await LeagueProxyInstance.leagueName())
  );

  
  // txn = await LeagueMakerInstance.addUsersToLeagueHelper(
  //   [owner.address, addr1.address, addr2.address, addr3.address],
  //   LeagueProxyInstance.address
  // );
  // //receipt = await txn.wait();
  txn = await LeagueMakerInstance.testCallDoesNotExist(
    LeagueProxyInstance.address
  );
  console.log(
    "League Proxy updated state: " 
      + "\n\tVersion: " + (await LeagueProxyInstance.version())
  );

    //*******************
  // Testing delegate call functionality within contract
  // */
  // txn = await LeagueMakerInstance.testCallDoesNotExist(
  //   LeagueProxyInstance2.address
  // );
  // txn = await LeagueMakerInstance.testCallDoesNotExist(
  //   LeagueProxyInstance2.address
  // );
  // receipt = await txn.wait();
  // for (const event of receipt.events) {
  //   if (event.event != null) {
  //     console.log(`Event ${event.event} with args ${event.args}`);
  //     //GameLogicCloneAddress = event.args;
  //   }
  // }


//Create Proxy
  // const LeagueProxyFactory = await ethers.getContractFactory(
  //   "LeagueBeaconProxy"
  // );
  // const delegateCallData = abi.encodeWithSignature("initialize(uint256)", parameters.version);
  // const LeagueBeaconProxy  = new LeagueBeaconProxy(
  //     address(upgradeableBeacon),
  //     delegateCallData
  // );

  // let func = web3.eth.abi.encodeFunctionCall(
  //   {
  //     name: "initialize",
  //     type: "function",
  //     inputs: [
  //       {
  //         type: "uint256",
  //         name: "_version",
  //       },
  //       {
  //         type: "uint256",
  //         name: "_numWeeks",
  //       },
  //       // {
  //       //   type: "address",
  //       //   name: "athletesDataStorage",
  //       // },
  //       {
  //         type: "string",
  //         name: "_name",
  //       },
  //     ],
  //   },
  //   [2, 8, "test name"]
  // );
  // const LeagueProxyInstance = await LeagueProxyFactory.deploy(
  //   BeaconInstance.address,
  //   func
  // );
  // const LeagueProxyInstance2 = await LeagueProxyFactory.deploy(
  //   BeaconInstance.address,
  //   func
  // );


  // console.log(
  //   "Game Logic updated state: " + (await GameLogicInstance.version())
  // );



  // console.log("LEague Proxy deployed to:", LeagueProxyInstance.address);
  // console.log("LEague Proxy 2 deployed to:", LeagueProxyInstance2.address);
  // // console.log("League Proxy details: " + JSON.stringify(LeagueProxyInstance, null, 2));
  // console.log(
  //   "LeagueProxy init state: " + (await LeagueProxyInstance.version())
  // );
  // console.log(
  //   "LeagueProxy2 init state: " + (await LeagueProxyInstance2.version())
  // );

  //*******************//
  //*******************//
  //     Playground    //
  //*******************//
  /*********************/
  //[owner, addr1] = await hre.ethers.getSigners();
  // await LeagueMakerInstance.connect(addr1);

  //Set league maker beacon
  //const txn = await LeagueMakerInstance.setBeacon();
  //const txn = await LeagueMakerInstance.setAdmin(act2);
  //console.log("txn result: " + JSON.stringify(txn, null, 2));

  //Create league that points to beacon
  // let txn = await LeagueMakerInstance.createLeague("test", 1);
  // //const txn = await LeagueMakerInstance.setAdmin(act2);
  // //console.log("txn result: " + JSON.stringify(txn, null, 2));
  // let receipt = await txn.wait()
  // let contractAddress;// = "0x4374EEcaAD0Dcaa149CfFc160d5a0552B1D092b0";
  // for (const event of receipt.events) {
  //   if(event.event != null) {
  //     console.log(`Event ${event.event} with args ${event.args}`);
  //     contractAddress = event.args[1];
  //     console.log("conract adress: " + contractAddress);
  //   }
  // }

  //Get Deployed League Proxy Init State
  // const contractAddress = "0x4374EEcaAD0Dcaa149CfFc160d5a0552B1D092b0";
  //const beaconProxyContract = await hre.ethers.getContractAt("LeagueBeaconProxy", contractAddress);
  //console.log("beacon details: " + JSON.stringify(BeaconInstance, null, 2));

  //console.log("BeaconProxy init state: " + await beaconProxyContract.version());
  //console.log("BeaconProxy test: " + await beaconProxyContract.incrementVersion());
  //const msgData = web3.eth.abi.encodeFunctionSignature("incrementVersion()");
  //const msgData = web3.eth.abi.encodeFunctionSignature('version()');
  //console.log("msgData: " + msgData);
  // //call incrementVersion on league proxy as non-admin
  //txn = await BeaconInstance.version();


  //Let's create a clone and test if it delegates calls correctly.
  //TODO let's save optimization for later and stick with beacon pattern for now
  // txn = await LeagueMakerInstance.createLeagueClone(GameLogicInstance.address);
  // var GameLogicCloneAddress = "";
  // receipt = await txn.wait();
  // for (const event of receipt.events) {
  //   if (event.event != null) {
  //     console.log(`Event ${event.event} with args ${event.args}`);
  //     GameLogicCloneAddress = event.args;
  //   }
  // }
  // console.log("Clone address: " + GameLogicCloneAddress);
  // const cloneContract = await hre.ethers.getContractAt("GameLogic", GameLogicCloneAddress);

  // console.log("GAme Logic address: " + cloneContract.address);
  //You can view hardhat node console to see console.log messages from contracts, and verify version state is changing in correct memory
  // txn = await LeagueMakerInstance.testCallDoesNotExist(
  //   GameLogicInstance.address
  // );


  //*******************
  // Testing delegate call functionality within contract
  // */
  // txn = await LeagueMakerInstance.testCallDoesNotExist(
  //   LeagueProxyInstance2.address
  // );
  // txn = await LeagueMakerInstance.testCallDoesNotExist(
  //   LeagueProxyInstance2.address
  // );
  // receipt = await txn.wait();
  // for (const event of receipt.events) {
  //   if (event.event != null) {
  //     console.log(`Event ${event.event} with args ${event.args}`);
  //     //GameLogicCloneAddress = event.args;
  //   }
  // }
  // txn = await LeagueMakerInstance.testCallDoesNotExist(
  //   cloneContract.address
  // );
  // txn = await LeagueMakerInstance.testCallDoesNotExist(
  //   GameLogicCloneAddress
  // );


  //Trying to trigger LeagueProxyInstance fallback function from web3 js 
  // const signature = web3.utils.sha3('incrementVersion()').slice(0,10);
  // //const msgData = signature;// + web3.utils.toHex(valueToUpdate).slice(2).padStart(64, '0');
        
  // const msgData = web3.eth.abi.encodeFunctionSignature("incrementVersion()");
  // // const msgData = web3.eth.abi.encodeFunctionSignature("initialize(uint256)",
  // //                                                      1);
  // // const msgData = "0x00";
  // txn = await web3.eth.sendTransaction({
  //   from: addr1,
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
  //txn = await LeagueProxyInstance.incrementVersion();
  // txn = await LeagueMakerInstance.testCallDoesNotExist(
  //   GameLogicInstance.address
  // );
  // receipt = await txn.wait();
  // for (const event of receipt.events) {
  //   if (event.event != null) {
  //     console.log(`Event ${event.event} with args ${event.args}`);
  //   }
  // }
  //console.log("Clone deployed to : " + JSON.stringify(receipt, null, 2));



  //console.log("txn: " + JSON.stringify(txn, null, 2));

  //txn = await LeagueProxyInstance.incrementVersion();
  // console.log(
  //   "League Proxy updated state: " + (await LeagueProxyInstance.version())
  // );
  // console.log(
  //   "Game Logic updated state: " + (await GameLogicInstance.version())
  // );

  //check the state of league proxy as admin

  //call incrementVersion on league proxy as non- admin //must implement incrementVersion in proxy

  //Upgrade LeagueMaker to new contract // must implement new logiclayer
}

main();
