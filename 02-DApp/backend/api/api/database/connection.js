const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../../.env' });

//Configuration for our connection to mongoDB
const mongoConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      //Specific properties we want (very standard configuration)
      useNewUrlParser: true,
      //   useCreateIndex: true,
      //   useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = mongoConnection;
