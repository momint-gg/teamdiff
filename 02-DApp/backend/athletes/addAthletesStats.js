// Script for appending athletes stats to the contract
// Env file should have correct private key to add stats (bc onlyOwner)
require('dotenv').config();
const { ethers } = require('ethers');
// Importing ABI for the athletes contract (need to update each time we deploy)
const abi = require('');

// Sample of how the athlete data may be passed in
const sampleAthleteData = [
  { name: 'Faker', id: 0, points: 4 },
  { name: 'John', id: 1, points: 3 },
];
// Sample contract address (on Rinkeby)
const sampleContractAddress = '';

async function main(contractAddress, athleteData) {
  // Test vars for now
  contractAddress = '';
  athleteData = sampleAthleteData;

  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  const contract = new ethers.Contract(contractAddress, abi.abi, rinkebySigner);

  for (let i = 0; i < sampleAthleteData.length; i++) {
    const addAthletesStatsTxn = await contract.appendStats(
      i, // index of athlete
      sampleAthleteData[i].points // their points for the week
    );
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
