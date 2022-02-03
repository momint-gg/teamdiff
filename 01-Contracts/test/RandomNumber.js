const chai = require("chai");
const hre = require("hardhat");
const linkABI = require("./abis/LinkABI.js");
const RandomNumber = artifacts.require("contracts/RandomNumber.sol");

describe("Random Number Test", () => {
  beforeEach(async () => {
    const RandomNumber = await hre.ethers.getContractFactory("RandomNumber");
    contract = await RandomNumber.deploy(3, 0);
    await contract.deployed();
  });

  it("Should return a random number....", async () => {
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const linkTokenContract = new hre.ethers.Contract(
      "0x01BE23585060835E02B77ef475b0Cc51aA1e0709", // Rinkeby LINK Contract Address
      linkABI,
      signer
    );

    var transferTransaction = await linkTokenContract.transfer(
      // Transferring some LINK to our contract
      contract.address,
      "1000000000000000000"
    );
    await transferTransaction.wait();
    console.log("hash:" + transferTransaction.hash);

    let txn = await contract.getRandomNumber();
    await txn.wait();

    //Wait for a min
    await new Promise((resolve) => setTimeout(resolve, 60000));

    const res = await contract.randomResult();
    console.log("random number result: " + res);
    console.log(
      "result: formatted bn" +
        new hre.ethers.BigNumber.from(res._hex).toString()
    );

    // expect((1).to.equal(1));
    // expect(res.to.not.equal(undefined));
  });
});

// Video that helped me with testing with Chainlink: https://www.youtube.com/watch?v=0r7mgJTeoD0&ab_channel=Chainlink
// ^ Also helps with understanding hardhat testing in general..
