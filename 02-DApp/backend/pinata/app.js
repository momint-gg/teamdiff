const fs = require("fs");
const pinataSDK = require("@pinata/sdk");

require("dotenv").config();

const pinata = pinataSDK(process.env.PINATA_KEY, process.env.SECRET_API_KEY);

async function uploadHeadshots(pathToHeadshotsDir) {
  const headshots = fs.readdirSync(pathToHeadshotsDir);

  for (let i = 0; i < headshots.length; i++) {
    console.log(`(Headshot ${i + 1}/${headshots.length}) ${headshots[i]}`);
    const readableStreamForFile = fs.createReadStream(
      pathToHeadshotsDir + `/${headshots[i]}`
    );
    let result = await pinata.pinFileToIPFS(readableStreamForFile);
    console.log(result.IpfsHash + "\n");
  }
}

async function main() {
  const auth = await pinata.testAuthentication();

  if (auth.authenticated === false) {
    console.log("ERROR: Not authenticated with Pinata! Terminating upload...");
    return;
  }

  const args = process.argv.slice(2);
  let pathToHeadshotsDir = "headshots";

  if (args.length === 1 && args[0] === "-p") {
    // If calling this script from datafetcher.py, the headshot folder
    // path is relative to datafetcher.py instead of pinata/app.js
    pathToHeadshotsDir = "../pinata/headshots";
  }

  await uploadHeadshots(pathToHeadshotsDir);
}

main();
