require('dotenv').config({ path: '../cridentials/.env' });
const mongoose = require('mongoose');

// MongoDB connection URI (stored in your `.env` file)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp'; // use local mongodb
console.log(mongoURI)

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

// Export the mongoose connection
module.exports = mongoose.connection;