const { ethers, upgrades } = require("hardhat");
var Web3 = require("web3");
const web3 = new Web3("https://cloudflare-eth.com");
const constructorArgs = require("../constructorArgs");


async function main() {
  // Deploying
  console.log("start");

  //Deploy Game Items contract
  /*const GameItemsFactory = await ethers.getContractFactory("GameItems");
  const GameItemsInstance = await GameItemsFactory.deploy(...constructorArgs, {
    //overriding gas bc transaction was stuck
    gasPrice: 203000000000,
  });
  await GameItemsInstance.deployed();
  console.log("GameItems deployed to:", GameItemsInstance.address);*/




  //Deploy a vrf consumer contract
  const subscription_id = 601;  
  const VRFv2ConsumerFactory = await ethers.getContractFactory("VRFv2Consumer");
  const VRFv2ConsumerInstance = await VRFv2ConsumerFactory.deploy(subscription_id);
  await VRFv2ConsumerInstance.deployed();
  console.log("VRFv2Consumer deployed to:", VRFv2ConsumerInstance.address);
  //console.log("VRF details: " + JSON.stringify(VRFv2ConsumerInstance, null, 2))

  //Generate random words
  const addr1 = "0x14D8DF624769E6075769a59490319625F50B2B17";
  VRFv2ConsumerInstance.connect(addr1);
  const txn = await VRFv2ConsumerInstance.requestRandomWords(    {
    gasPrice: 10000000000,
    gasLimit: 900000000
    });
  console.log("txn: " + JSON.stringify(txn, null, 2));
  console.log("random words: " + await VRFv2ConsumerInstance.s_randomWords());


  //Generate random words again
//   txn = await VRFv2ConsumerInstance.requestRandomWords({
//     //overriding gas bc transaction was stuck
//     gasPrice: 203000000000,
//   });
//   console.log("txn: " + JSON.stringify(txn, null, 2));
//   console.log("random words: " + await VRFv2ConsumerInstance.s_randomWords());
  //Call the random contracts
//   txn = await GameItemsInstance.grabRandomWord(
//     rngAddress
//   );
//   receipt = await txn.wait();
//   for (const event of receipt.events) {
//     if (event.event != null) {
//       console.log(`Event ${event.event} with args ${event.args}`);
//     }
//   }

  //Wait the for thevent to return a value

  //Check that the event balue is random
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