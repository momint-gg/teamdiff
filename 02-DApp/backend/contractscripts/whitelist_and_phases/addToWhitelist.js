// Lil script for adding people in excel sheet to whitelist
require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { GameItems } = require('../contract_info/contractAddresses');
const GameItemsJSON = require('../contract_info/abis/GameItems.json');
const XLSX = require('xlsx');
const web3 = require('web3');

// TODO:
const main = async () => {
  // Constructing our contract
  // TODO: Change to matic
  // console.log('Game items address is ', GameItems);
  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(
    process.env.TEAMDIFF_PRIVATE_KEY,
    provider
  );
  contract = new ethers.Contract(GameItems, GameItemsJSON.abi, rinkebySigner);

  // Reading WL in from excel
  whitelist = []; // Users we're going to WL
  const parseExcel = (filename) => {
    const excelData = XLSX.readFile(filename);

    return Object.keys(excelData.Sheets).map((name) => ({
      name,
      data: XLSX.utils.sheet_to_json(excelData.Sheets[name]),
    }));
  };

  parseExcel('./TeamDiff Final WL.xlsx').forEach((element) => {
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
};

const runMain = async () => {
  try {
    console.log('Running main...\n');
    await main();

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
