// No need for more than one routes file
// Contains the routes: /allAthletes/:name, /athlete/:name

const express = require('express');
const mongoose = require('mongoose');
const AthleteDataEntry = require('../models/AthleteDataEntry');
const router = express.Router();

// Getting all of our athletes for a given week
// Example use: GET /allAthletes/0
router.get('/allAthletes/:week', async (req, res) => {
  try {
    const allAthletes = await AthleteDataEntry.find({
      week_num: req.params.week,
    });
    res.json(allAthletes);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Getting a specific athletes weekly data
// Example use: GET /athlete/beserker
router.get('/athlete/:name', async (req, res) => {
  try {
    const athleteData = await AthleteDataEntry.find({ name: req.params.name });
    res.json(athleteData);
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.put('/athleteData', async (req, res) => {
  try {
    const sampleData = new AthleteDataEntry({
      id: 1,
      name: 'TEST NAME',
      points: 0,
      avg_kills: 0,
      avg_deaths: 0,
      avg_assists: 0,
      CSM: 0,
      VSPM: 0,
      FBpercent: 0,
      pentakills: 0,
      week_num: 1,
    });
    await sampleData.save();
    // res.json();
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
