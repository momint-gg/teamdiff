// Appending athletes stats to the contract

// This script:
// 1. Reads in from the athlete stats excel sheet
// 2. Creates a final stats object with athlete ID, name, points, etc.
// 3. Exports this data to database for the API to use
// 4. Pushes the finalized athlete stats to the Athletes.sol contract

require("dotenv").config({ path: "../.env" });
const { ethers } = require("hardhat");

const athleteToId = require("../prodScripts/athleteToId"); // Mapping athlete to their ID
const XLSX = require("xlsx");
const fs = require("fs");
const axios = require("axios");

// TODO: comment out which contracts/ABIs you're not using
const abi = require("../../../02-DApp/backend/contractscripts/contract_info/rinkebyAbis/Athletes.json");
// const {
//   Athletes,
// } = require(".../../../02-DApp/backend/contractscripts/contract_info/contractAddressesMatic");
// const abi = require("../../../02-DApp/backend/contractscripts/contract_info/maticAbis/Athletes.json");
// const {
//   CONTRACT_ADDRESSES,
// } = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby");
const {
  Athletes,
} = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby");

async function main() {
  // console.log("Athletes: " + Athletes)
  // TODO:
  // Need to hardcode this week num for now since can't pass in.. to do: pull from contract (LeagueMaker) or Athletes (add function for week number in athletes)
  // Maybe when eval match is called, we can also increment some value in the athletes contract? -- do later...
  week_num = 0;

  // Getting our contract
  const AthletesContract = await ethers.getContractAt("Athletes", Athletes);

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

  parseExcel("./scripts/athletes/week_dummy_data.xlsx").forEach((element) => {
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
    const name = data[i]["Player"].toLowerCase(); // Gamer name columnn
    let points = Math.round(data[i]["Points"]); // Total points column (rounded)
    if (points < 0) points = 0; // Can't push negative number to contract...
    const id = athleteToId[name];
    // Minor stats
    const avg_kills = data[i]["Avg kills"];
    const avg_deaths = data[i]["Avg deaths"];
    const avg_assists = data[i]["Avg assists"];
    const CSM = data[i]["CSM"];
    const VSPM = data[i]["VSPM"];
    const FBpercent = data[i]["FB %"];
    const pentakills = data[i]["Penta Kills"];

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
        week_num,
      });
      athleteToBoolArr[id] = true;
    } else {
      // Athletes that aren't in TeamDiff (starters are benched)
      console.log("Athlete named ", name, " is not in TeamDiff");
    }
  }

  // Adding the benched starters with point vals of 0
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
        week_num,
      });
      console.log("Athlete with id ", i, " was benched for the week");
    }
  }

  const finalObj = {};
  finalObj["data"] = finalStatsToPush;

  // Pushing the data to our Web2 API for frontend rendering
  try {
    await axios.put(
      `https://teamdiff-backend-api.vercel.app/api/athleteData/${JSON.stringify(
        finalObj
      )}`
    );
    console.log("Stats pushed to Web2 API!");
  } catch (error) {
    console.log("Error: ", error);
  }

  // Finally, pushing stats to the contract
  console.log("Now pushing stats to contract");
  for (let i = 0; i < finalStatsToPush.length; i++) {
    const addAthletesStatsTxn = await AthletesContract.appendStats(
      finalStatsToPush[i].id, // index of athlete
      finalStatsToPush[i].points, // their points for the week,
      week_num, // Week number passed in
      {
        gasLimit: 20000000
      }
    );
    console.log(
      "Adding points: ",
      finalStatsToPush[i].points,
      " for athlete id ",
      finalStatsToPush[i].id,
      `(${finalStatsToPush[i].name})`
    );
    // Waiting for txn to mine
    await addAthletesStatsTxn.wait();
  }
}

// Quick check to make sure contract updates
const testContract = async () => {
  // Making sure 50 athletes
  let txn = await AthletesContract.getAthletes();
  console.log("Number of athletes is ", txn);

  // Making sure new stats that were pushed match finalStatsToPush(just checking 5 athletess)
  const randomIndexes = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 5)
  );

  // 5 random athletes ID and points
  let randomAthletePoints = [];
  for (let i = 0; i < randomIndexes.length; i++) {
    randomAthletePoints.push({
      id: finalStatsToPush[randomIndexes[i]].id,
      points: finalStatsToPush[randomIndexes[i]].points,
    });
  }
  // Checking the contract for those same IDs
  const idsToCheck = randomAthletePoints.map((athlete) => athlete.id);
  console.log("Random athletes selected are: ", randomAthletePoints);
  console.log("Now checking contract for IDs ", idsToCheck);

  pointsRetrievedFromContract = [];
  for (let i = 0; i < randomAthletePoints.length; i++) {
    txn = await AthletesContract.getAthleteScores(idsToCheck[i]);
    // console.log(Number(txn[week_num]));
    pointsRetrievedFromContract.push(Number(txn[week_num]));
  }

  // Checking to see if our scores from the excel sheet match the contract (if this passes, it all works!)
  let numFails = 0;
  for (let i = 0; i < pointsRetrievedFromContract.length; i++) {
    if (pointsRetrievedFromContract[i] !== randomAthletePoints[i].points) {
      numFails++;
    }
  }

  console.log("\n");
  numFails === 0
    ? console.log("Test succeeded! \n")
    : console.log("Test failed ", numFails, "times.\n");
};

const runMain = async () => {
  try {
    console.log("Running main...\n");
    await main();
    console.log("Testing contract...\n");
    await testContract();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
