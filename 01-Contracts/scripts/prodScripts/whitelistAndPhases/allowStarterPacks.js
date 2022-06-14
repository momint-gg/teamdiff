// Siulating a user minting and burning (for full matic test)

require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { GameItems } = require('../contract_info/contractAddresses');
const GameItemsJSON = require('../contract_info/abis/GameItems.json');

// TODO:
const main = async () => {
  // Constructing our contract
  const provider = new ethers.providers.AlchemyProvider(
    'matic',
    process.env.MATIC_KEY
  );
  const signer = new ethers.Wallet(process.env.TEAMDIFF_PRIVATE_KEY, provider);
  contract = new ethers.Contract(GameItems, GameItemsJSON.abi, signer);

  let txn = await contract.allowStarterPacks();
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
