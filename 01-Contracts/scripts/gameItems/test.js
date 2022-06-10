// Final MATIC testinfg
const { ethers } = require("hardhat");
const constructorArgs = require("../../constructorArgs");

const main = async () => {
  GameItemFactory = await ethers.getContractFactory("GameItems");
  GameItem = await GameItemFactory.deploy(...constructorArgs);
  [owner, addr1, addr2] = await ethers.getSigners();
  await GameItem.deployed();
  GameItem.connect(owner);
  console.log("GameItems.sol deployed to: " + GameItem.address);

  let txn = await GameItem.setStartingIndex();
  console.log("Setting starting indices");
  await txn.wait();
  txn = await GameItem.setURIs(); // This takes awhile
  console.log("Setting URIs");
  await txn.wait();

  const addUser = await GameItem.connect(owner).addUsersToWhitelist([
    //Note: pass in as array in js script
    owner.address,
  ]);
  await addUser.wait();

  // Opening private sale
  txn = await GameItem.connect(owner).openPrivateSale();
  await txn.wait();
  // Whitelisted users can mint packss
  txn = await GameItem.connect(owner).mintStarterPack();
  await txn.wait();
  console.log("Waiting 2 min to burn starter pack. Check metadata!");
  delay(120000); // Waiting 2 mins so we can check metadata

  // Now burning a starter pack
  txn = await GameItem.connect(owner).allowStarterPacks();
  await txn.wait();
  txn = await GameItem.connect(owner).burnStarterPack();
  await txn.wait();

  // Minting booster pack
  txn = await GameItem.connect(owner).openBoosterPackSale();
  await txn.wait();
  txn = await GameItem.connect(owner).mintBoosterPack();
  await txn.wait();
  console.log("Waiting 2 min to burn booster pack. Check metadata!");
  delay(120000); // Waiting 2 mins so we can check metadata

  // Now burning a booster pack
  txn = await GameItem.connect(owner).allowBoosterPacks();
  await txn.wait();
  txn = await GameItem.connect(owner).burnBoosterPack();
  await txn.wait();
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
