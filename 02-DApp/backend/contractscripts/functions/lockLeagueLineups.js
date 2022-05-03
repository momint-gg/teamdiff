// Calling evaluateWeekForAllLeagues() from LeagueMaker.sol
// Appending athletes stats to the contract

require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const abi = require('../contract_info/abis/LeagueMaker.json');
const { LeagueMaker } = require('../contract_info/contractAddresses');

async function main() {
  // Constructing our contract
  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  const contract = new ethers.Contract(LeagueMaker, abi.abi, rinkebySigner);

  // Calling onlyOwner Function
  let txn = await contract
    .connect(rinkebySigner)
    // When finding the gas price and gas limit, check etherscan so you don't set above limit
    .lockLeagueLineups();
  await txn.wait();
  console.log('lockLeagueLineups(): ', txn);
}

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
