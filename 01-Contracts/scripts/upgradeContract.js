const { ethers, upgrades } = require("hardhat");
var Web3 = require('web3'); 
const web3 = new Web3("https://cloudflare-eth.com");

async function main() {
  // Deploying

  //Create GAme Logicr 
  const GameLogicFactory = await ethers.getContractFactory("GameLogic");
  const GameLogicInstance = await GameLogicFactory.deploy();
  await GameLogicInstance.deployed();
  console.log("GameLogic deployed to:", GameLogicInstance.address);


  //Create League Maker 
  const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");
  const LeagueMakerInstance = await LeagueMakerFactory.deploy(GameLogicInstance.address);
  await LeagueMakerInstance.deployed();
  console.log("LeageMaker deployed to:", LeagueMakerInstance.address);

  //Create Beacon
  const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
  const BeaconInstance = await BeaconFactory.deploy(GameLogicInstance.address);
  await BeaconInstance.deployed();
  console.log("Beacon deployed to:", BeaconInstance.address);


  //Create Proxy
  const LeagueProxyFactory = await ethers.getContractFactory("LeagueBeaconProxy");
  // bytes memory delegateCallData = abi.encodeWithSignature("initialize(uint256)", parameters.version);
  // LeagueBeaconProxy proxy = new LeagueBeaconProxy(
  //     address(upgradeableBeacon),
  //     delegateCallData
  // );
  
  let func = web3.eth.abi.encodeFunctionCall({
    name: 'initialize',
    type: 'function',
    inputs: [{
        type: 'uint256',
        name: '_version'
    }]
  }, [1]);
  const LeagueProxyInstance = await LeagueProxyFactory.deploy(BeaconInstance.address, func);
  //const LeagueProxyInstance = await LeagueProxyFactory.deploy(BeaconInstance.address, web3.eth.abi.encodeFunctionSignature('initialize(uint256)'));
  await LeagueProxyInstance.deployed();
  console.log("LEague Proxy deployed to:", LeagueProxyInstance.address);
  // console.log("League Proxy details: " + JSON.stringify(LeagueProxyInstance, null, 2));
  console.log("LeagueProxy init state: " + await LeagueProxyInstance.version());



  //*******************//
  //*******************//
  //     Playground    //
  //*******************//
  /*********************/
  [owner, addr1] = await hre.ethers.getSigners();
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

  //You can view hardhat node console to see console.log messages from contracts, and verify version state is changing in correct memory
  txn = await LeagueMakerInstance.testCallDoesNotExist(LeagueProxyInstance.address);
  txn = await LeagueMakerInstance.testCallDoesNotExist(LeagueProxyInstance.address);
  txn = await LeagueMakerInstance.testCallDoesNotExist(GameLogicInstance.address);
  receipt = await txn.wait();
  for (const event of receipt.events) {
    if(event.event != null) {
      console.log(`Event ${event.event} with args ${event.args}`);
    }
  }
  // txn = await web3.eth.sendTransaction({
  //   from: addr1,
  //   to: contractAddress,
  //   value: 0,     // If you want to send ether with the call.
  //   // gas: ???,       // If you want to specify the gas.
  //   // gasPrice: ???,  // If you want to specify the gas price.
  //   data: msgData},
  // );

  //console.log("txn: " + JSON.stringify(txn, null, 2));

  //txn = await LeagueProxyInstance.incrementVersion();
  console.log("League Proxy updated state: " + await LeagueProxyInstance.version());
  console.log("Game Logic updated state: " + await GameLogicInstance.version());

  //check the state of league proxy as admin

  //call incrementVersion on league proxy as non- admin //must implement incrementVersion in proxy

  //Upgrade LeagueMaker to new contract // must implement new logiclayer
}

main();