// Testing to make sure athletes stats were added correctly

require('dotenv').config({ path: '../.env' }); // Put env file in contractscripts main folder
const { ethers } = require('ethers');
const abi = require('../contract_info/abis/Athletes.json');
const sampleAthleteData = require('../sampleAthleteData');
const { Athletes } = require('../contract_info/contractAddresses');

async function main() {
  // Constructing our contract
  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  const contract = new ethers.Contract(Athletes, abi.abi, rinkebySigner);
  console.log('Starting txn test');

  // Getting the total # athletes
  const numAthletes = Number(await contract.getNumAthletes());
  console.log('Num athletes is ', numAthletes);

  // Getting athletes stats
  let txn = await contract.getStats();
  await txn.wait();
  console.log('STATS: ', txn);

  // Getting weekly stats for all athletes
  for (let i = 0; i < numAthletes; i++) {
    txn = await contract.getAthleteScores(i);
    const readableData = txn.map((num) => Number(num));
    console.log('STATS FOR ', sampleAthleteData[i].name, ': ', readableData);
  }
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
