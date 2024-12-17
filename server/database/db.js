require('dotenv').config({ path: '../cridentials/.env' });
const mongoose = require('mongoose');

// MongoDB connection URI (stored in your `.env` file)
// const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp'; // use local mongodb
const mongoURI = process.env.MONGO_URI; // use local mongodb
// console.log(mongoURI)

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to Remote MongoDB!');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB atlas, ' + err.message);
    mongoose.connect('mongodb://localhost:27017/todoapp')
      .then(() => {
        console.log('Connected to Local MongoDB!');
      })
      .catch((err) => {
        console.error('Failed to connect to Local MongoDB: ' + err.message);
      });
  });

// Export the mongoose connection
module.exports = mongoose.connection;