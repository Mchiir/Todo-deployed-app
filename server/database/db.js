require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Connect to MongoDB using provided URI
 * @param {string} dbUrl - MongoDB connection string
 */
async function connectDB(dbUrl) {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return mongoose.connection;
  } catch (error) {
    throw error; // Let caller handle it
  }
}

module.exports = connectDB;