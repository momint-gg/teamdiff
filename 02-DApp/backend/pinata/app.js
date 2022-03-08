const fs = require("fs");
const pinataSDK = require("@pinata/sdk");
require("dotenv").config();

const PINATA_KEY = "";
const SECRET_API_KEY = "";

const pinata = pinataSDK(PINATA_KEY, SECRET_API_KEY);

async function uploadHeadshots(pathToHeadshotsDir) {
    const auth = await pinata.testAuthentication();

    if (auth.authenticated === false) {
        console.log("ERROR: Not authenticated with Pinata! Terminating upload...");
        return;
    }

    const files = fs.readdirSync(pathToHeadshotsDir);

    for (let i = 0; i < files.length; i++) {
        console.log(`(${i + 1}/${files.length}) ${files[i]}`);
        const readableStreamForFile = fs.createReadStream(
            pathToHeadshotsDir + `/${files[i]}`
        );
        let result = await pinata.pinFileToIPFS(readableStreamForFile);
        console.log(result.IpfsHash);
    }
}

async function main() {
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