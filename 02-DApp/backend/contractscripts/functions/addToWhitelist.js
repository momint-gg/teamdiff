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
  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
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

  parseExcel('./test_whitelist.xlsx').forEach((element) => {
    data = element.data;
  });

  // Change 500 to adjust for how many you want to add to WL
  for (let i = 0; i < data.length; i++) {
    whitelist.push(data[i]['Users']);
  }
  console.log(whitelist);

  // Converting ENS addresses to address
  for (let i = 0; i < whitelist.length; i++) {
    if (!web3.utils.isAddress(whitelist[i])) {
      web3.eth.ens.resolver(whitelist[i]).then((contract) => {
        console.log(contract);
      });
    }
  }

  // Adding users to whitelist
  // let txn = await
};

const testWL = async () => {
  // Checking length of whitelist
};

const runMain = async () => {
  try {
    console.log('Running main...\n');
    await main();
    // console.log('Testing whitelist...\n');
    // await testWL();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
