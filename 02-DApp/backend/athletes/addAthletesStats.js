// Script for appending athletes stats to the contract
// Env file should have correct private key to add stats (bc onlyOwner)

require('dotenv').config();
const { ethers } = require('ethers');
const abi = require('./abis/Athletes.json');
const sampleAthleteData = require('./sampleAthleteData');

// Sample contract address (on Rinkeby)
const sampleContractAddress = '0x57a45Bfd7C5E53ac0FbF73Bc4b916B0F49b0fE94';

async function main() {
  // Test vars for now

  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  const contract = new ethers.Contract(
    sampleContractAddress,
    abi.abi,
    rinkebySigner
  );

  for (let i = 0; i < sampleAthleteData.length; i++) {
    console.log('Adding athletes stats for ', i);
    const addAthletesStatsTxn = await contract.appendStats(
      i, // index of athlete
      sampleAthleteData[i].points // their points for the week
    );
    console.log('Adding points: ', sampleAthleteData[i].points);
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
