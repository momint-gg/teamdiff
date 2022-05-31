// Appending athletes stats to the contract

require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const abi = require('../contract_info/abis/Athletes.json');
const athleteToId = require('../athleteToId');
const { Athletes } = require('../contract_info/contractAddresses');

async function main() {
  // Constructing our contract
  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  const contract = new ethers.Contract(Athletes, abi.abi, rinkebySigner);

  // Parsing excel
  finalStatsToPush = [];

  // Adding stats
  for (let i = 0; i < sampleAthleteData.length; i++) {
    console.log('Adding athletes stats for ', i);
    const addAthletesStatsTxn = await contract.appendStats(
      i, // index of athlete
      sampleAthleteData[i].points // their points for the week
    );
    console.log('Adding points: ', sampleAthleteData[i].points);
    // Waiting for txn to mine
    await addAthletesStatsTxn.wait();
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
