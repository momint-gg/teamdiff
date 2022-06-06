// No need for more than one routes file
// Contains the routes: /allAthletes/:name, /athlete/:name

const express = require('express');
const mongoose = require('mongoose');
const AthleteDataEntry = require('../models/AthleteDataEntry');
const router = express.Router();
const athleteData = require('../athleteData/stats.json');

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
    const data = athleteData['data'];
    for (let i = 0; i < data.length; i++) {
      console.log(data[i]);
      const newAthleteDataEntry = new AthleteDataEntry({ ...data[i] });
      const saved = await newAthleteDataEntry.save();
      //   res.json(saved);
    }
    res.json({ message: 'Done adding athlete data! Check the DB now.' });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
