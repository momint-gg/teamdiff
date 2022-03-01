// Calling onlyOwner function was an issue, so making a function that transfers ownership
const hre = require("hardhat");

// Make sure to run this on network rinkeby!

const main = async () => {
  // Note: this function can only be called by the owner of vrfv2consumer (the address below)

  // Current contract address for VRFv2Consumer
  const contractAddress = "0xce33C9b8d69Fb99a715279503980Cf54f9A57218";

  // Put the new owner here! Should be the latest (rinkeby) GameItems contract
  // May be changing a lot while testing
  const newOwner = "0x22957d77E09E68df9B57B768e11CD917619942eE";

  const VRFv2ConsumerInstance = await hre.ethers.getContractAt(
    "VRFv2Consumer",
    contractAddress
  );
  //   VRFv2ConsumerInstance.connect("");

  console.log("Got contract");

  // Request a new random word -- takes a few minutes for new random word to populate in s_randomWords
  /* NOTE: This requestRandomWords calls a callback function rawFuffileRandomWords(), which takes
    a few minutes to update the s_randomWords array with new random values. It won't be instant, as
    assume by this script */
  let txn = await VRFv2ConsumerInstance.addAddressToWhitelist(newOwner, {
    // gasPrice: 52000000000,
    // gasLimit: 30091486,
  });
  await txn.wait();

  console.log(txn);
  console.log("Added to whitelist!");
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
