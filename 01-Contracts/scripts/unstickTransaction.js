const hre = require("hardhat");

const main = async () => {
  console.log("sending a 0 ETH transaction with higher gas to cancel...");

  const tx = {
    nonce: nonceOfPendingTx,
    to: hre.ethers.constants.AddressZero,
    data: "0x",
    gasPrice: 203000000000,
  }; // costs 21000 gas

  signer.sendTransaction(tx);
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
