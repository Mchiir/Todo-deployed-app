require('dotenv').config(); // Load env variables
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI)
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Connected to Remote MongoDB!');
    }
  })
  .catch((err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to connect to MongoDB:', err.message);
    }

    // Fallback to local database only in development mode
    if (process.env.NODE_ENV !== 'production') {
      mongoose.connect('mongodb://localhost:27017/todoapp')
        .then(() => {
          console.log('Connected to Local MongoDB!');
        })
        .catch((err) => {
          console.error('Failed to connect to Local MongoDB:', err.message);
        });
    }
  });

module.exports = mongoose.connection;
