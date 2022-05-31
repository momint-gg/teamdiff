// Appending athletes stats to the contract

require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const abi = require('../contract_info/abis/Athletes.json');
const athleteToId = require('../athleteToId');
const { Athletes } = require('../contract_info/contractAddresses');

const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');
numAthletes = 50; // Fixing a bug

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

  const parseExcel = (filename) => {
    const excelData = XLSX.readFile(filename);

    return Object.keys(excelData.Sheets).map((name) => ({
      name,
      data: XLSX.utils.sheet_to_json(excelData.Sheets[name]),
    }));
  };

  for (let i = 0; i < numAthletes; i++) {
    if (i == 0) continue;
    const name = data[i]['__EMPTY'];
    const points = data[i]['__EMPTY_1'];
    const id = athleteToId[name];
    finalStatsToPush.push({ id: id, points: points });
  }

  // Adding stats
  for (let i = 0; i < sampleAthleteData.length; i++) {
    console.log('Adding athletes stats for ', i);
    const addAthletesStatsTxn = await contract.appendStats(
      finalStatsToPush[i].id, // index of athlete
      finalStatsToPush[i].points // their points for the week
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
