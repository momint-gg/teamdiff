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
//MATIC
const {
  Athletes,
  LeagueMaker,
} = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddressesMatic");
const athletesABI = require("../../../02-DApp/backend/contractscripts/contract_info/maticAbis/Athletes.json");

//RINKEBY
// const {
//   Athletes,
// } = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby");
// const {
//   Athletes,
//   LeagueMaker,
// } = require("../../../02-DApp/backend/contractscripts/contract_info/contractAddressesRinkeby");

async function main(week_num) {
  // Getting MATIC contracts this way (old way glitching)
  // const provider = new ethers.providers.AlchemyProvider(
  //   "matic",
  //   process.env.POLYGON_ALCHEMY_KEY
  // );
  // const provider = new ethers.providers.AlchemyProvider(
  //   "rinkeby",
  //   process.env.RINKEBY_ALCHEMY_KEY
  // );
  // const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  AthletesContract = await ethers.getContractAt("Athletes", Athletes);
  // AthletesContract = new ethers.Contract(Athletes, athletesABI.abi, signer);
  // LeagueMakerContract = await ethers.getContractAt("LeagueMaker", LeagueMaker);

  // Parsing excel
  finalStatsToPush = [];
  const parseExcel = (filename) => {
    const excelData = XLSX.readFile(filename);

    // All of the sheets in our excel file
    excelSheets = Object.keys(excelData.Sheets).map((name) => ({
      name,
      data: XLSX.utils.sheet_to_json(excelData.Sheets[name]),
    }));

    return excelSheets;
  };

  // Getting an object key by its value
  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  const allSheets = []; // Going to add all of our sheet objects here (diff weeks)
  parseExcel(`./scripts/athletes/Week1_Week4.xlsx`).forEach((element) => {
    allSheets.push({ name: element.name, data: element.data });
  });

  // Setting which sheet to use
  for (let i = 0; i < allSheets.length; i++) {
    const sheet = allSheets[i];
    if (week_num === sheet.name.split(" ")[1] - 1) {
      data = sheet.data;
      // name = sheet.name;
      console.log("Sheet found for week_num # " + week_num);
    }
  }

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
    let points = Math.round(data[i]["Total Points"]); // Total points column (rounded)
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

    console.log("Name is ", name, " \n and points are ", points, "\n id ", id);
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
  // try {
  //   await axios.put(
  //     `https://teamdiff-backend-api.vercel.app/api/athleteData/${JSON.stringify(
  //       finalObj
  //     )}`
  //   );
  //   console.log("Stats pushed to Web2 API!");
  // } catch (error) {
  //   console.log("Error: ", error);
  // }

  // Finally, pushing stats to the contract
  console.log("Now pushing stats to contract");
  for (let i = 0; i < finalStatsToPush.length; i++) {
    const addAthletesStatsTxn = await AthletesContract.appendStats(
      finalStatsToPush[i].id, // index of athlete
      finalStatsToPush[i].points, // their points for the week,
      week_num
      // week_num, // Week number passed in
      // {
      //   gasLimit: 27000000,
      // }
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

  testContract();
}

// Quick check to make sure contract updates
const testContract = async () => {
  console.log("Testing the contract...");
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
    await main(0);
    await main(1);
    await main(2);
    await main(3);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
