const hre = require("hardhat");
const metadataJSON = require("../metadata/nft_metadata");

const calculateOrder = async () => {
  //Object with the athlete index and position
  let athleteIndexToPosition = [];
  var count = 0;
  for (var property in metadataJSON) {
    //making a list with the indices
    let position = metadataJSON[property].attributes[1].value;
    console.log("Position:", position);

    //Adding to array to later rearrange for order
    athleteIndexToPosition.push({ index: count, pos: position });
    count++;
  }
  console.log(athleteIndexToPosition);

  //Now we rearrange so no positions repeat
  let mids = [];
  let supports = [];
  let bots = [];
  let coaches = [];
  let jungles = [];

  for (let i = 0; i < athleteIndexToPosition.length; i++) {
    if (athleteIndexToPosition[i].pos === "Mid")
      mids.push(athleteIndexToPosition[i]);
    if (athleteIndexToPosition[i].pos === "Support")
      supports.push(athleteIndexToPosition[i]);
    if (athleteIndexToPosition[i].pos === "Bot")
      bots.push(athleteIndexToPosition[i]);
    if (athleteIndexToPosition[i].pos === "Coach")
      coaches.push(athleteIndexToPosition[i]);
    if (athleteIndexToPosition[i].pos === "Jungle")
      jungles.push(athleteIndexToPosition[i]);
  }

  let newAthleteOrdering = [];
  for (let i = 0; i < 50; i++) {
    if (athleteIndexToPosition[i].index === 63) return;
    //where repeat pos starts
    else {
      if (jungles[i]) newAthleteOrdering.push(jungles[i]);
      if (bots[i]) newAthleteOrdering.push(bots[i]);
      if (supports[i]) newAthleteOrdering.push(supports[i]);
      if (mids[i]) newAthleteOrdering.push(mids[i]);
      if (coaches[i]) newAthleteOrdering.push(coaches[i]);
    }
  }

  console.log(newAthleteOrdering);
  console.log("Length of new athlete ordering ", newAthleteOrdering.length);

  //This is the final deliverable isayah can use
  var indices = newAthleteOrdering.map((entry) => entry.index);
  console.log(indices);
};

const runMain = async () => {
  try {
    await calculateOrder();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
