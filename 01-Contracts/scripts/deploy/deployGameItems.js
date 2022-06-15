const { ethers } = require("hardhat");
const fs = require('fs');
const constructorArgs = require("../../constructorArgs");


const main = async () => {
  
  console.log("Deploying GameItems Contract...");
  let textData = "";
  // textData += "exports.GameItems = '0xdFE4F029E7086a1Eb5616240F4AAc7B964A7874b';\n";
  
  // Create GameItems Instance
  const gameContractFactory = await hre.ethers.getContractFactory("GameItems");
  const gameContract = await gameContractFactory.deploy(...constructorArgs);
  // const gameContract = await gameContractFactory.deploy(...constructorArgs, {
  //   //overriding gas bc transaction was stuck
  //   // gasPrice: 1000000000,
  //   gasLimit: 20000000
  // });
  await gameContract.deployed();

  textData += "exports.GameItems = \'" + gameContract.address + "\';\n";
  console.log("exports.GameItems = \'" + gameContract.address + "\';\n");
  
  //Add users to gameitems whitelist
  // txn = await gameContract.addUserToWhitelist("0x14D8DF624769E6075769a59490319625F50B2B17")
  // await txn.wait();
  // console.log("Added Trey to whitelist");

  // gameContract.addUserToWhitelist("0xD926A3ddFBE399386A26B4255533A865AD98f7E3")
  // await txn.wait();
  // console.log("Added Trey2 to whitelist");
  
  // gameContract.addUserToWhitelist("0x69EC014c15baF1C96620B6BA02A391aBaBB9C96b")
  // await txn.wait();
  // console.log("Added Will to whitelist");
  
  // gameContract.addUserToWhitelist("0xbd478094c0D2511Ac5e8bD214637947149bC210f")
  // await txn.wait();
  // console.log("Added Katie to whitelist");
  
  // gameContract.addUserToWhitelist("0xC3aaa1a446ED0f2E1c9c0AcC89F47c46F30c8Bf3")
  // await txn.wait();
  // console.log("Added Reggie to whitelist");
  
  // gameContract.addUserToWhitelist("0x37D1431D5D423d66ad6F369EF1bB0767E71A8400")
  // await txn.wait();
  // console.log("Added Zach G to whitelist");
  
  //Initial functions that need to be run
  console.log("First setting starting index...");
  txn = await gameContract.setStartingIndex();
  // txn = await gameContract.setStartingIndex({
  //   gasLimit: 25000000,
  //   gasPrice: 30000000000
  // });
  await txn.wait();

  console.log("Now setting token URIs...");
  txn = await gameContract.setURIs();
  await txn.wait();


  


  
 
  /**
   * Note this overwrites the existing file
   */
  fs.writeFileSync('../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby.js', textData, (err) => {
    // In case of a error throw err.
    if (err) {
      console.log("bad");
      throw err;
    }
    console.log("done writing to file");

  })

  //This copies the abi from our build folder to a dedicated folder in the backend folder
  let contractNames = ["GameItems"]
  contractNames.forEach(async (contractName) => {
    let srcPath = "./build/contracts/contracts/" + contractName + ".sol/" + contractName + ".json";
    let backendPath = "../02-DApp/backend/contractscripts/contract_info/abis/" + contractName + ".json";
    const abiData = fs.readFileSync(srcPath)
    fs.writeFileSync(backendPath, abiData, (err) => {
      // In case of a error throw err.
      if (err) {
        console.log("bad");
        throw err;
      }
      console.log("done writing to file");
  
    })

  })
  console. log("script completed");
  
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

//Latest contract address (rinkeby) --> 0x94b90ca07014F8B67A6bCa8b1b7313d5fD8D2160 (created 2/10 4pm)
