import bodyParser from "body-parser";
import e from "cors";
import cors from "cors";
import express from "express";
import fs from "fs";
import glob from "glob";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the teamdiff internal API!");
});

// TODO: Adjust these calls
app.get("/aggregated_stats", (req, res) => {
  const newestFile = glob
    .sync("../datafetcher/agg_stats/*json")
    .map((name) => ({ name, ctime: fs.statSync(name).ctime }))
    .sort((a, b) => b.ctime - a.ctime)[0].name;

  const rawAggStats = fs.readFileSync(newestFile);
  const aggStats = JSON.parse(rawAggStats);

  res.send(aggStats);
});

app.get("/aggregated_stats/:date", (req, res) => {
  const requestDate = req.params["date"];
  const path = `../datafetcher/agg_stats/${requestDate}-aggregated_stats.json`;

  if (fs.existsSync(path)) {
    const rawAggStats = fs.readFileSync(path);
    const aggStats = JSON.parse(rawAggStats);
    res.send(aggStats);
  } else {
    res.status(400).send("No aggregated stats data from that date!");
  }
});

app.get("/game_stats", (req, res) => {
  console.log(req.params);
  const newestFile = glob
    .sync("../datafetcher/game_stats/*json")
    .map((name) => ({ name, ctime: fs.statSync(name).ctime }))
    .sort((a, b) => b.ctime - a.ctime)[0].name;

  const rawGameStats = fs.readFileSync(newestFile);
  const gameStats = JSON.parse(rawGameStats);
  res.send(gameStats);
});

app.get("/game_stats/:date", (req, res) => {
  const requestDate = req.params["date"];
  const path = `../datafetcher/game_stats/${requestDate}-game_stats.json`;

  if (fs.existsSync(path)) {
    const rawGameStats = fs.readFileSync(path);
    const gameStats = JSON.parse(rawGameStats);
    res.send(gameStats);
  } else {
    res.status(400).send("No game stats data from that date!");
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}...`);
});
