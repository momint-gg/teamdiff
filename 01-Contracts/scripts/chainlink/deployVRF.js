const hre = require("hardhat");

// Separating the deploy code for VRF into another script
const main = async () => {
  // Deploying the contract ---------------------------------------

  // const subscription_id = 697; //Henry subscription ID
  // const VRFv2ConsumerFactory = await hre.ethers.getContractFactory(
  //   "VRFv2Consumer"
  // );
  // const VRFv2ConsumerInstance = await VRFv2ConsumerFactory.deploy(
  //   subscription_id
  // );
  // await VRFv2ConsumerInstance.deployed();
  // console.log("VRFv2Consumer deployed to:", VRFv2ConsumerInstance.address);
  // // console.log("VRF details: " + JSON.stringify(VRFv2ConsumerInstance, null, 2));

  // console.log("waiting now...");
  // await new Promise((resolve) => setTimeout(resolve, 1000 * 45));

  // Testing out our deployed contract ---------------------------------------
  const contractAddress = "0x613314B67165013054fA0497b7074189b411fee1";
  const VRFv2ConsumerInstance = await hre.ethers.getContractAt(
    "VRFv2Consumer",
    contractAddress
  );
  console.log("Got contract");

  // Request a new random word -- takes a few minutes for new random word to populate in s_randomWords
  /* NOTE: This requestRandomWords calls a callback function rawFuffileRandomWords(), which takes
    a few minutes to update the s_randomWords array with new random values. It won't be instant, as
    assume by this script */
  let txn = await VRFv2ConsumerInstance.requestRandomWords({
    gasPrice: 52000000000,
    // gasLimit: 30091486,
  });
  await txn.wait();
  console.log("Called requestRandomWords() " + JSON.stringify(txn, null, 2));

  console.log("Waiting 60 secs for request to fulfill...");
  await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 1));

  // Get existing random word generated
  txn = await VRFv2ConsumerInstance.s_randomWords(0);
  // await txn.wait();
  console.log("random #1: " + txn);
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
