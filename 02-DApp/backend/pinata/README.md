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