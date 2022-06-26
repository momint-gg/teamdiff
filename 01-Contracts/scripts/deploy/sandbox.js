const { ethers } = require("hardhat");
// import { providers } from "ethers";
const CONTRACT_ADDRESSES = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby.js");
// const { GameItems } = require('../../../02-DApp/backend/contractscripts/contract_info/contractAddresses');
const LeagueOfLegendsLogicJSON = require('../../../02-DApp/backend/contractscripts/contract_info/rinkebyAbis/LeagueOfLegendsLogic.json');
const AthletesJSON = require('../../../02-DApp/backend/contractscripts/contract_info/rinkebyAbis/Athletes.json');
const XLSX = require('xlsx');
// const web3 = require('web3');

const main = async () => {
  console.log("sandboxing...");

    // Create GameItems Instance
  // const contract = await ethers.getContractAt("LeagueBeaconProxy", "0x39aa9eFAF4136aaA2E2760D69Afe6732A085f9E5")
  // const contract = await ethers.getContractAt("GameItems", CONTRACT_ADDRESSES.GameItems)
  
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    process.env.RINKEBY_ALCHEMY_KEY
  );
  const signer = new ethers.Wallet(process.env.RINKEBY_PRIVATE_KEY, provider);

  //Create league proxy instance
  const LeagueProxyContract = new ethers.Contract(
    "0x56783cc09C773FeC7FFA3396e2C8Aec629dfeFF0",
    LeagueOfLegendsLogicJSON.abi,
    signer
  );

  //Set League SChedule
  console.log("setting schedule")
  let txn = await LeagueProxyContract.setLeagueSchedule({
    gasLimit: 20000000
  }).catch((e) => {
    console.error("errpor: " + e)
  })
  await txn.wait();

//  Deploying athletes contract
  // const AthletesContractFactory = await ethers.getContractFactory("Athletes");
  // const AthletesContractInstance = await AthletesContractFactory.deploy(); // Setting supply as 100
  // await AthletesContractInstance.deployed();
  // // AthletesContractInstance.connect(owner);
  // console.log("Athletes Deployed to: " + AthletesContractInstance.address);
  // textData += "exports.Athletes = \'" + AthletesContractInstance.address + "\';\n";
  // textData +=
  //   "exports.Athletes = '0xA35Cb8796d9C94fc06aA5f9AB646d97f4F3aD0ef';\n";

  // //Set Private Sale Open ready for testing
  // console.log("Opening private Sale");
  // txn = await contract.openPrivateSale();
  // await txn.wait();

  // Manually add to address Open ready for testing
  // console.log("Adding User to whitelsit");
  // txn = await contract.addUserToWhitelist("0xa3b9818D2B2ED2548C6873c17a4bf8B611A801b4");
  // await txn.wait();
  
  //Set Public Sale Open ready for testing
  // console.log("Opening public sale");
  // txn = await contract.openPublicSale();
  // await txn.wait();

  // Set Private Sale Open ready for testing
  // console.log("Opening burning reveal");
  // txn = await contract.allowStarterPacks();
  // await txn.wait();

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
