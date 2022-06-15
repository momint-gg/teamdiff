const { ethers } = require("hardhat");
// import { providers } from "ethers";
const CONTRACT_ADDRESSES = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddresses.js");
// const { GameItems } = require('../../../02-DApp/backend/contractscripts/contract_info/contractAddresses');
// const GameItemsJSON = require('./../../02-DApp/backend/contractscripts/contract_info/abis/GameItems.json');
const XLSX = require('xlsx');
// const web3 = require('web3');

const main = async () => {
  console.log("sandboxing...");

    // Create GameItems Instance
  const contract = await ethers.getContractAt("GameItems", CONTRACT_ADDRESSES.GameItems)


  console.log("got game items address")


  // //Set Private Sale Open ready for testing
  // console.log("Opening private Sale");
  // txn = await contract.openPrivateSale();
  // await txn.wait();

  //Manually add to address Open ready for testing
  // console.log("Adding User to whitelsit");
  // txn = await contract.addUserToWhitelist("0x550B8Cf3e728eb22C40D2a4a6EBE1365e06BA871");
  // await txn.wait();
  
  //Set Public Sale Open ready for testing
  // console.log("Opening public sale");
  // txn = await contract.openPublicSale();
  // await txn.wait();

  // Set Private Sale Open ready for testing
  console.log("Opening burning reveal");
  txn = await contract.allowStarterPacks();
  await txn.wait();

  // Reading WL in from excel
  /*
  let whitelist = []; // Users we're going to WL
  const parseExcel = (filename) => {
    const excelData = XLSX.readFile(filename);

    return Object.keys(excelData.Sheets).map((name) => ({
      name,
      data: XLSX.utils.sheet_to_json(excelData.Sheets[name]),
    }));
  };

  let data;
  parseExcel("./scripts/deploy/TeamDiff Final WL.xlsx").forEach((element) => {
    data = element.data;
  });

  // Adding to WL array
  const firstAddy = '0x37D1431D5D423d66ad6F369EF1bB0767E71A8400';
  whitelist.push(firstAddy);

  for (let i = 0; i < data.length; i++) {
    if (data[i][firstAddy].length > 0) whitelist.push(data[i][firstAddy]);
  }
  console.log(whitelist);

  // Adding users to whitelist
  let txn = await contract.addUsersToWhitelist(whitelist.slice(0, 500));
  await txn.wait();
  txn = await contract.addUsersToWhitelist(whitelist.slice(500, 1000));
  await txn.wait();
  txn = await contract.addUsersToWhitelist(whitelist.slice(1000, 1500));
  await txn.wait();
  txn = await contract.addUsersToWhitelist(whitelist.slice(1500, 2000));
  await txn.wait();
  txn = await contract.addUsersToWhitelist(whitelist.slice(2000, 2500));
  await txn.wait();
  txn = await contract.addUsersToWhitelist(whitelist.slice(2500, 3000));
  await txn.wait();
  txn = await contract.addUsersToWhitelist(whitelist.slice(3000, 3500));
  await txn.wait();
  txn = await contract.addUsersToWhitelist(whitelist.slice(3500, data.length));
  await txn.wait();

  // Checking length of whitelist
  const numWhitelisted = await contract.getNumWhitelisted();
  // const numWhitelisted = await contract.numWhitelisted();

  Number(numWhitelisted) === data.length
    ? console.log(
        'Successfully added everyone to WL! Added ',
        Number(numWhitelisted),
        ' people.'
      )
    : console.log(
        "Error adding people to WL. Lengths don't match. Length of WL in contract is ",
        Number(numWhitelisted)
      );
*/
  console.log("Sandbox script complete")

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
