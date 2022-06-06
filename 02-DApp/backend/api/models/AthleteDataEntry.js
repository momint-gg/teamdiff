const mongoose = require('mongoose');

const AthleteDataEntrySchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  avg_kills: {
    type: Number,
    required: true,
  },
  avg_deaths: {
    type: Number,
    required: true,
  },
  avg_assists: {
    type: Number,
    required: true,
  },
  CSM: {
    type: Number,
    required: true,
  },
  VSPM: {
    type: Number,
    required: true,
  },
  FBpercent: {
    type: Number,
    required: true,
  },
  pentakills: {
    type: Number,
    required: true,
  },
  week_num: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model(
  'AthleteDataEntry',
  AthleteDataEntrySchema,
  'athlete_data'
);
