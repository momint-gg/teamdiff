// @Trey running this as a node script (not hardhat)
// Don't wanna use any hardhat stuff here bc of lack of Beacon Proxy support
//Note: Must run with "node henryProxyTest.js" (not npx hardhat...)

require("dotenv").config();
const { ethers } = require("ethers");
var Web3 = require("web3");
const web3 = new Web3("https://cloudflare-eth.com");
const LeagueBeaconProxyJSON = require("../build/contracts/contracts/GameLogic.sol/GameLogic.json");

async function main() {
  console.log("Starting");
  //Creating a new contract instance wiht the abi and address (must test on rinkeby)
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.ALCHEMY_KEY
  );
  const wallet = process.env.PRIVATE_KEY;
  console.log("Making wallet");
  const rinkebySigner = new ethers.Wallet(wallet, provider);
  console.log("Wallet made");
  // Hardcoded for now...
  const leagueProxyInstanceAddress =
    "0x5beBaB6dFcA391A6aC6117346d02D962d389fb57";

  console.log("Constructing the contract ");
  const LeagueProxyInstance = new ethers.Contract(
    leagueProxyInstanceAddress,
    LeagueBeaconProxyJSON.abi,
    rinkebySigner
  );

  console.log(
    "Logging version --> ",
    Number(await LeagueProxyInstance.version())
  );
  //console.log("Logging functions --> ", await LeagueProxyInstance.functions);

  const testIncrementVersion = await LeagueProxyInstance.incrementVersion();
  var receipt = await testIncrementVersion.wait();
  for (const event of receipt.events) {
    if (event.event != null) {
      console.log(`Event ${event.event} with args ${event.args}`);
      leagueProxyContractAddress = event.args[1];
    }
  }
  console.log("Done incrementing version! ", testIncrementVersion);
  console.log(
    "Logging version after calling incrementVersion() --> ",
    Number(await LeagueProxyInstance.version())
  );

  //#1
  //Use eth.sendTransaction to deployed LeagueProxy Instance
  let accounts = await web3.eth.getAccounts();
  //web3.eth.defaultAccount = accounts[0];
  const msgData = web3.eth.abi.encodeFunctionSignature("incrementVersion()");
  // // const msgData = "0x00";

  const txn = await web3.eth.sendTransaction(
    {
      from: accounts[0].address,
      to: LeagueProxyInstance.address,
      //value: 1,     // If you want to send ether with the call.
      //gas: 2,       // If you want to specify the gas.
      // gasPrice: ???,  // If you want to specify the gas price.
      data: msgData,
    },
    function (err, transactionHash) {
      if (err) {
        console.log(err);
      } else {
        console.log(transactionHash);
      }
    }
  );
  console.log("sending transaction...");
  var leagueProxyContractAddress;
  receipt = await txn.wait();
  for (const event of receipt.events) {
    if (event.event != null) {
      console.log(`Event ${event.event} with args ${event.args}`);
      leagueProxyContractAddress = event.args[1];
    }
  }
  console.log(
    "Logging version after calling incrementVersion() --> ",
    Number(await LeagueProxyInstance.version())
  );
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
