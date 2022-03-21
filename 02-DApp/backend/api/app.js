import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs";

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
    res.send("Welcome to the internal API!");
});

app.get("/stats/currentWeek", (req, res) => {
    const rawAggStats = fs.readFileSync("../datafetcher/aggregated_stats.json");
    const aggStats = JSON.parse(rawAggStats);
    res.send(aggStats);
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}...`);
});
