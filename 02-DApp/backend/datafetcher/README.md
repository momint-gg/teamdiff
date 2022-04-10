# Datafetcher

## Installation

Works with Python 3.7 or higher

#### Install dependencies
Run the following command in the `backend/datafetcher` folder to install required modules.
```
pip3 install -r requirements.txt
```

#### Pinata
Make sure to run ```npm install``` in the `backend/pinata` folder because the datafetcher will call the `backend/pinata/app.js` script. You must also put your Pinata API keys in `backend/pinata/app.js`.

The `backend/pinata/app.js` script is responsible for uploading headshots to IPFS/Pinata, so simply replace the `backend/pinata/headshots` folder with an updated headshots folder to push new headshots to IPFS/Pinata. Each headshot must be a .png file and named after the athlete's summonerId in lowercase:

```
{athlete_summoner_id}.png
```

For example, a headshot for Takeover would be:

```
takeover.png
```

## USAGE

#### datafetcher.py
```
python3 datafetcher.py -a {path/to/athlete_source_file.csv} -t {Tournament name} -d {Number of days in the past to fetch query fetch from}
```
The following command will fetch LCS Spring 2022 tournament game stats for all athletes in athletes.csv from the past 7 days:
```
python3 datafetcher.py -a athletes.csv -t "LCS Spring 2022" -d 7
```

#### athlete_source_file.csv

The `athlete_source_file.csv` must be a csv file with each athlete's summonerId on a separate line like this:

```
bob
tom
jimmy
jane
sarah
```
