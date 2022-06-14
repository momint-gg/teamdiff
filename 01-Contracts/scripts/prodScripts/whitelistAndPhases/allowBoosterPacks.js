// Allowing booster packs to be opened (to be run on TBD)

require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { GameItems } = require('../contract_info/contractAddresses');
const GameItemsJSON = require('../contract_info/abis/GameItems.json');

// TODO:
const main = async () => {
  // Constructing our contract
  const provider = new ethers.providers.AlchemyProvider(
    'matic',
    process.env.POLYGON_ALCHEMY_KEY
  );
  const signer = new ethers.Wallet(process.env.TEAMDIFF_PRIVATE_KEY, provider);
  contract = new ethers.Contract(GameItems, GameItemsJSON.abi, signer);

  let txn = await contract.allowBoosterPacks();
  await txn.wait();
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
