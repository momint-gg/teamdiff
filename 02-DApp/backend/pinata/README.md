# Pinata

## Installation

```
npm install
```

You must put your Pinata API keys in `backend/pinata/app.js`.

The `backend/pinata/app.js` script is responsible for uploading headshots to IPFS/Pinata, so simply replace the `backend/pinata/headshots` folder with an updated headshots folder to push new headshots to IPFS/Pinata. Each headshot must be a .png file and named after the athlete's summonerId in lowercase:

```
{athlete_summoner_id}.png
```

For example, a headshot for Takeover would be:

```
takeover.png
```

## Usage

```
node app.js
```

## Using the push_headshots and generate_metadata to generate new metadata

- You should run the push_headshots script to push headshots to pinata
- Headshots should be read from the 'headshots' folder in the pinata folder and each headshot should have the athlete name (ex: Abedagge.png)
- You should copy the console output from push_headshots into generate_metadata (as an object -- {name: "pinata hash", name: "pinata hash"}) and then run generate_metadata
- Final metadata will be dumped in final_metadata folder as separate JSON files numbered 0-num Athletes.json (0.json, 1.json, ...)
- You can then upload this folder to pinata and use that in the GameItems constructor which sets the URI(s) for athlete metadata
