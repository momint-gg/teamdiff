require('dotenv').config();
const fs = require('fs');
const pinataSDK = require('@pinata/sdk');

// ADD IN YOUR OWN KEYS HERE
const PINATA_KEY='f6d42225a14dc568107e';
const SECRET_API_KEY='72ebc73480ebf7dda08117e7e85b6e5e7632f20b562c5336443607ee7e3ab56a';

const pinata = pinataSDK(PINATA_KEY, SECRET_API_KEY);

async function uploadHeadshots(pathToHeadshotsDir) {
  const headshots = fs.readdirSync(pathToHeadshotsDir);

  for (let i = 0; i < headshots.length; i++) {
    console.log(`(Headshot ${i + 1}/${headshots.length}) ${headshots[i]}`);
    const readableStreamForFile = fs.createReadStream(
      pathToHeadshotsDir + `/${headshots[i]}`
    );
    let result = await pinata.pinFileToIPFS(readableStreamForFile);
    console.log(result.IpfsHash + '\n');
  }
}

async function main() {
  const auth = await pinata.testAuthentication();

  if (auth.authenticated === false) {
    console.log('ERROR: Not authenticated with Pinata! Terminating upload...');
    return;
  }

  const args = process.argv.slice(2);
  let pathToHeadshotsDir = 'headshots';

  if (args.length === 1 && args[0] === '-p') {
    // If calling this script from datafetcher.py, the headshot folder
    // path is relative to datafetcher.py instead of pinata/app.js
    pathToHeadshotsDir = '../pinata/headshots';
  }

  await uploadHeadshots(pathToHeadshotsDir);
}

main();
