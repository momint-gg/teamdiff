// Appending athletes stats to the contract

require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const abi = require('../contract_info/abis/Athletes.json');
const { Athletes } = require('../contract_info/contractAddresses');
const athleteToId = require('../athleteToId'); // Mapping athlete to their ID

// Modules for parsing excel
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

// NOTE: In the functions folder (same directory as this file) you should put the excel file with two columns: name, points

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

  parseExcel('./week_dummy_data.xlsx').forEach((element) => {
    data = element.data;
  });

  for (let i = 0; i < 50; i++) {
    // Looping through all of our athletes
    const name = data[i]['Player'].toLowerCase(); // Gamer name columnn
    const points = Math.round(data[i]['Points']); // Total points column
    const id = athleteToId[name];
    console.log('Name is ', name, ' \n and points are ', points, '\n id ', id);
    finalStatsToPush.push({ id: id, points: points });
    console.log(Object.keys(finalStatsToPush).length);
  }

  // Finally, pushing stats to the contract
  // for (let i = 0; i < sampleAthleteData.length; i++) {
  //   console.log('Adding athletes stats for ', i);
  //   const addAthletesStatsTxn = await contract.appendStats(
  //     finalStatsToPush[i].id, // index of athlete
  //     finalStatsToPush[i].points // their points for the week
  //   );
  //   console.log(
  //     'Adding points: ',
  //     finalStatsToPush[i].points,
  //     ' for athlete ',
  //     finalStatsToPush[i].name
  //   );
  //   // Waiting for txn to mine
  //   await addAthletesStatsTxn.wait();
  // }
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
