require('dotenv').config();
const { CallMadeSharp } = require('@material-ui/icons');
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

// Script pushing the latest headshots to pinata and returning an array of objects containing the name to image url
// Inserted into metadata for each athlete

async function pushHeadshots() {
  // ADD IN YOUR OWN KEYS HERE
  const PINATA_KEY = process.env.PINATA_KEY;
  const SECRET_API_KEY = process.env.PINATA_SECRET_KEY;

  const pinata = pinataSDK(PINATA_KEY, SECRET_API_KEY);

  // Reading in our headshots
  const headshots = fs.readdirSync('headshots');

  finalArr = [];
  for (let i = 0; i < headshots.length; i++) {
    console.log(`(Headshot ${i + 1}/${headshots.length}) ${headshots[i]}`);
    const readableStreamForFile = fs.createReadStream(
      `headshots/${headshots[i]}`
    );
    let result = await pinata.pinFileToIPFS(readableStreamForFile);
    console.log(result.IpfsHash + '\n');

    // Creating array with athlete name to their ipfs hash
    const athleteName = headshots[i].split('.')[0];
    const pinataHash = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    const currStr = `"${athleteName}": "${pinataHash}/",`;
    finalArr.push(currStr);
  }

  for (let i = 0; i < finalArr.length; i++) {
    console.log(finalArr[i]);
  }
}

const runMain = async () => {
  try {
    await pushHeadshots();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
return finalArr;
