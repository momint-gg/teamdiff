// Moving henryProxyTest.js stuff over here
// This doesn't work lol let's just use the other script for now...
const { expect } = require("chai");
const hre = require("hardhat");
const LeagueBeaconProxyJSON = require("../build/contracts/contracts/GameLogic.sol/GameLogic.json");

describe("LeagueProxy.test", async () => {
  before(async () => {
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
    LeagueProxyInstance = new ethers.Contract(
      leagueProxyInstanceAddress,
      LeagueBeaconProxyJSON.abi,
      signer
    );
  });

  it("Calls incrementVersion() successfully", async () => {
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
    receipt = await txn.wait();
    for (const event of receipt.events) {
      if (event.event != null) {
        console.log(`Event ${event.event} with args ${event.args}`);
        //leagueProxyContractAddress = event.args[1];
      }
    }
    console.log(
      "Logging version after calling incrementVersion() --> ",
      Number(await LeagueProxyInstance.version())
    );
  });
});
