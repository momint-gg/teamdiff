const { ethers, upgrades } = require("hardhat");

async function main() {
  /*
  Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

  Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
  Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
  */
  // Deploying
  const GameLogicFactory = await ethers.getContractFactory("GameLogic");
  // const GameLogicInstance = await upgrades.deployProxy(GameLogicFactory, []);
  const GameLogicInstance = await GameLogicFactory.deploy();

  await GameLogicInstance.deployed();
  //await box.deployed();
  console.log("GameLogic deployed to:", GameLogicInstance.address);


  //Create LEague Proxy
  const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker");
  // const LeagueMakerInstance = await upgrades.deployProxy(LeagueMakerFactory, [GameLogicInstance.address,  ["0x00","0xaa", "0xff"]]);
  const LeagueMakerInstance = await LeagueMakerFactory.deploy(GameLogicInstance.address);

  await LeagueMakerInstance.deployed();
  //await box.deployed();
  console.log("LeageMaker deployed to:", LeagueMakerInstance.address);
  //console.log("Leage contract info " + JSON.stringify(LeagueMakerInstance.interface.functions, null, 2));


  // //Get data on address, impl address, state, and admin of league proxy
  //console.log("LeageMaker impl address: " + await LeagueMakerInstance.setBeacon());
  console.log("LeagueMaker beacon: " + await LeagueMakerInstance.beaconAddress());
  //console.log("LeagueMaker impl address: " + await LeagueMakerInstance.getImplementation());

  console.log("LeagueMaker state: " + await LeagueMakerInstance.version());

  //call incrementVersion on league proxy as non-admin
  const admin = "0x0000000000000000000000000000000000000000";
  const act2 = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  [owner, addr1] = await hre.ethers.getSigners();
  //await GameItem.deployed();
  await LeagueMakerInstance.connect(addr1);

  //Set league maker beacon
  //const txn = await LeagueMakerInstance.setBeacon();
  //const txn = await LeagueMakerInstance.setAdmin(act2);
  //console.log("txn result: " + JSON.stringify(txn, null, 2));

  //Create league that points to beacon
  const txn = await LeagueMakerInstance.createLeague("test");
  //const txn = await LeagueMakerInstance.setAdmin(act2);
  console.log("txn result: " + JSON.stringify(txn, null, 2));
  //console.log("LeagueMaker state: " + await LeagueMakerInstance.version());

  // //Change admin
  // txn = await LeagueMakerInstance.connect(addr1).setAdmin(act2);
  // console.log("LeageProxy admin: " + await LeagueMakerInstance.getAdmin(1));
  // console.log("txn result: " + JSON.stringify(txn, null, 2));
  //console.log("LeagueMaker state: " + await LeagueMakerInstance.version());


  //check the state of league proxy as admin

  //call incrementVersion on league proxy as non- admin //must implement incrementVersion in proxy

  //Upgrade LeagueMaker to new contract // must implement new logiclayer




  //check the 
  //console.log("GameLogic secretNumber: " + await LogicInstance.secretNumber());
  //console.log("GameLogic Version: " +await  LogicInstance.version());
  // Upgrading
//   const LogicLayerV2 = await ethers.getContractFactory("BoxV2");
//   const upgraded = await upgrades.upgradeProxy(LogicInstance.address, LogicLayerV2);
}

main();