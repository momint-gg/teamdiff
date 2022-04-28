// If we want to write tests for the add athletes script
// Actually just making this a normal script instead of a test cuz fuck chai rn lol
// I'm also drunk a lil
require('dotenv').config();
const { ethers } = require('ethers');
const abi = require('./abis/Athletes.json');
const sampleAthleteData = require('./sampleAthleteData');

async function main() {
  const contractAddress = '0x57a45Bfd7C5E53ac0FbF73Bc4b916B0F49b0fE94';

  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  const contract = new ethers.Contract(contractAddress, abi.abi, rinkebySigner);
  console.log('Starting txn test');

  const numAthletes = Number(await contract.getNumAthletes());
  console.log('Num athletes is ', numAthletes);

  let txn = await contract.getStats();
  await txn.wait();
  console.log('STATS: ', txn);

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
