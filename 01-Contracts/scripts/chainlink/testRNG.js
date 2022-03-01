const hre = require("hardhat");

const contractAddress = "0xB69b679a88442A154cd92f6CCbBB19bc07bAfc1d";
const myContract = await hre.ethers.getContractAt(
  "VRFv2Consumer",
  contractAddress
);

let txn = await myContract.requestRandomWords();
console.log("Transaction completed at ", txn.address());

txn = await myContract.s_randomWords();
console.log(txn);
