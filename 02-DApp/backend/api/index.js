require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const mongoDB = require('./api/database/connection');
const routes = require('./api/routes/main');

// Middleware
const app = express();
app.use(cors());
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
app.use(express.json({ extended: false }));

// MongoDB server
mongoDB();

app.get('/', (req, res) => {
  res.send('Welcome to the teamdiff internal API!');
});

// Routes
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}...`);
});
