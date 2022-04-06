// @Trey running this as a node script (not hardhat)
// Don't wanna use any hardhat stuff here bc of lack of Beacon Proxy support
//Note: Must run with "node henryProxyTest.js" (not npx hardhat...)

require("dotenv").config();
const { ethers } = require("ethers");
const LeagueBeaconProxyJSON = require("../build/contracts/contracts/LeagueBeaconProxy.sol/LeagueBeaconProxy.json");

async function main() {
  console.log("Starting");
  //Creating a new contract instance wiht the abi and address (must test on rinkeby)
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  const wallet = process.env.PRIVATE_KEY;
  console.log("Making wallet");
  const signer = new ethers.Wallet(wallet, provider);
  console.log("Wallet made");
  // Hardcoded for now...
  const leagueProxyInstanceAddress =
    "0x5beBaB6dFcA391A6aC6117346d02D962d389fb57";

  console.log("Constructing the contract ");
  const LeagueProxyInstance = new ethers.Contract(
    leagueProxyInstanceAddress,
    LeagueBeaconProxyJSON.abi,
    signer
  );

  console.log(
    "Logging version --> ",
    Number(await LeagueProxyInstance.version())
  );
  console.log("Logging functions --> ", await LeagueProxyInstance.functions);

  // const testIncrementVersion = await LeagueProxyInstance.incrementVersion();
  // await testIncrementVersion.wait();
  // console.log("Done incrementing version! ", testIncrementVersion);
}

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
