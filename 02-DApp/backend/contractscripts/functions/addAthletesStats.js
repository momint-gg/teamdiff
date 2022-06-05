// Appending athletes stats to the contract

// This script:
// 1. Reads in from the athlete stats excel sheet
// 2. Creates a final stats object with athlete ID, name, points, etc.
// 3. Exports this weekly data to the athleteData folder in api for the frontend to retrieve
// 4. Pushes the finalized athlete stats to the Athletes.sol contract

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

// How to run: node addAthletesStats week_num (e.g. node addAthletesStats 1)
// We should start at week 0
async function main() {
  const week_num = process.argv[2];

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

  // Getting an object key by its value
  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  parseExcel('./week_dummy_data.xlsx').forEach((element) => {
    data = element.data;
  });

  // Array to check if athlete was benched or not for the week
  // In next step we will loop through and set any athlete that hasn't been benched to true
  // Resulting athletes (AKA athletes who val is still false) will be added with points of 0
  const athleteToBoolArr = new Array(50);
  for (let i = 0; i < athleteToBoolArr.length; i++) {
    athleteToBoolArr[i] = false;
  }

  // Looping through all of our athletes
  for (let i = 0; i < 50; i++) {
    // Main stats
    const name = data[i]['Player'].toLowerCase(); // Gamer name columnn
    const points = Math.round(data[i]['Points']); // Total points column (rounded)
    const id = athleteToId[name];
    // Minor stats
    const avg_kills = data[i]['Avg kills'];
    const avg_deaths = data[i]['Avg deaths'];
    const avg_assists = data[i]['Avg assists'];
    const CSM = data[i]['CSM'];
    const VSPM = data[i]['VSPM'];
    const FBpercent = data[i]['FB %'];
    const pentakills = data[i]['Penta Kills'];

    // console.log('Name is ', name, ' \n and points are ', points, '\n id ', id);
    if (id !== undefined) {
      // Only IDs in our league should be updated
      finalStatsToPush.push({
        id,
        name,
        points,
        avg_kills,
        avg_deaths,
        avg_assists,
        CSM,
        VSPM,
        FBpercent,
        pentakills,
      });
      athleteToBoolArr[id] = true;
    } else {
      // Athletes that aren't in TeamDiff (starters are benched)
      // console.log('Athlete named ', name, ' is not in TeamDiff');
    }
  }

  for (let i = 0; i < athleteToBoolArr.length; i++) {
    if (!athleteToBoolArr[i]) {
      finalStatsToPush.push({
        id: i,
        name: getKeyByValue(athleteToId, i),
        points: 0,
        avg_kills: 0,
        avg_deaths: 0,
        avg_assists: 0,
        CSM: 0,
        VSPM: 0,
        FBpercent: 0,
        pentakills: 0,
      });
      // console.log('Athlete with id ', i, ' was benched for the week');
    }
  }

  // Creating JSON of our final stats
  const finalObj = {};
  finalObj['athletes'] = finalStatsToPush;
  // console.log(JSON.stringify(finalObj));

  // Writing this week's athlete data to API folder in JSON format for the API
  fs.writeFileSync(
    path.resolve(`../../api/athleteData/`, `week${week_num}.json`),
    JSON.stringify(finalObj)
  );

  // Finally, pushing stats to the contract
  // for (let i = 0; i < 50; i++) {
  //   console.log('Adding athletes stats for athlete index ', i);

  //   const addAthletesStatsTxn = await contract.appendStats(
  //     finalStatsToPush[i].id, // index of athlete
  //     finalStatsToPush[i].points // their points for the week
  //   );
  //   console.log(
  //     'Adding points: ',
  //     finalStatsToPush[i].points,
  //     ' for athlete id ',
  //     finalStatsToPush[i].id
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
