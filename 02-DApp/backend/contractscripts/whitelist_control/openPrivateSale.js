// Opening up the private sale for everyone (to be run on 6/9)
require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { GameItems } = require('../contract_info/contractAddresses');
const GameItemsJSON = require('../contract_info/abis/GameItems.json');

// TODO:
const main = async () => {
  // Constructing our contract
  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  contract = new ethers.Contract(GameItems, GameItemsJSON.abi, rinkebySigner);
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
