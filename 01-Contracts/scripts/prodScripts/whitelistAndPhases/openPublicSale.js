// Already did this
// // Opening up the private sale for everyone (to be run on 6/10)

// require('dotenv').config({ path: '../.env' });
// const { ethers } = require('ethers');
// const { GameItems } = require('../contract_info/contractAddresses');
// const GameItemsJSON = require('../contract_info/abis/GameItems.json');

// // TODO:
// const main = async () => {
//   // Constructing our contract
//   const signer = new ethers.providers.AlchemyProvider(
//     'matic',
//     process.env.POLYGON_ALCHEMY_KEY
//   );
//   const rinkebySigner = new ethers.Wallet(
//     process.env.TEAMDIFF_PRIVATE_KEY,
//     provider
//   );
//   contract = new ethers.Contract(GameItems, GameItemsJSON.abi, signer);

//   let txn = await contract.openPublicSale();
//   await txn.wait();
// };

// const runMain = async () => {
//   try {
//     console.log('Running main...\n');
//     await main();
//     process.exit(0);
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

// runMain();
