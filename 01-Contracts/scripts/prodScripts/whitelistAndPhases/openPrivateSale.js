// Already did this
// // Opening up the private sale for everyone (to be run on 6/9)

// require('dotenv').config({ path: '../.env' });
// const { ethers } = require('ethers');
// const { GameItems } = require('../contract_info/contractAddresses');
// const GameItemsJSON = require('../contract_info/abis/GameItems.json');

// // TODO:
// const main = async () => {
//   // Constructing our contract
//   console.log('Provider...');
//   const provider = new ethers.providers.AlchemyProvider(
//     'matic',
//     'oyBI8KPs0CEqpheAG_EtQnm_c6fGB1l4'
//   );
//   console.log('Signer...');
//   const signer = new ethers.Wallet(
//     '886a7fca29a02d5b0dd6e5018326f7efe8272f082055999c0b1bc6b89ae0eac6',
//     provider
//   );
//   console.log('Contract');
//   contract = new ethers.Contract(GameItems, GameItemsJSON.abi, signer);

//   let txn = await contract.openPrivateSale();
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
