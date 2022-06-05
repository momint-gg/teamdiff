import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';

import { readFile } from 'fs/promises';
// Importing all of our weekly JSON
const week0JSON = JSON.parse(
  await readFile(new URL('./athleteData/week0.json', import.meta.url))
);
const week1JSON = JSON.parse(
  await readFile(new URL('./athleteData/week1.json', import.meta.url))
);
const week2JSON = JSON.parse(
  await readFile(new URL('./athleteData/week2.json', import.meta.url))
);
const week3JSON = JSON.parse(
  await readFile(new URL('./athleteData/week3.json', import.meta.url))
);
const week4JSON = JSON.parse(
  await readFile(new URL('./athleteData/week4.json', import.meta.url))
);
const week5JSON = JSON.parse(
  await readFile(new URL('./athleteData/week5.json', import.meta.url))
);
const week6JSON = JSON.parse(
  await readFile(new URL('./athleteData/week6.json', import.meta.url))
);
const week7JSON = JSON.parse(
  await readFile(new URL('./athleteData/week7.json', import.meta.url))
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the teamdiff internal API!');
});

// Getting all athletes for a certain week
// Example query: GET apiURL/allAthletes/1 -- getting all for week 1
app.get('/allAthletes/:week', (req, res) => {
  const week = req.params['week'];
  const json = eval(`week${week}JSON`); // Convert to var name
  res.json(json);
});

// Isayah old stuff
// app.get("/aggregated_stats", (req, res) => {
//     const rawAggStats = fs.readFileSync("../datafetcher/aggregated_stats.json");
//     const aggStats = JSON.parse(rawAggStats);
//     res.send(aggStats);
// });
// app.get("/game_stats", (req, res) => {
//     const rawGameStats = fs.readFileSync("../datafetcher/game_stats.json");
//     const gameStats = JSON.parse(rawGameStats);
//     res.send(gameStats);
// });

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}...`);
});
