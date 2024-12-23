import mongoose from 'mongoose';

const localMongoURI = 'mongodb://localhost:27017/todoapp-TS';

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(localMongoURI);
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }

  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to the database.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from the database.');
  });
};

// Close the Mongoose connection when the application terminates
const handleAppTermination = () => {
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to application termination.');
    process.exit(0);
  });
};

// Initialize the database connection
const initializeDatabase = (): void => {
  connectToDatabase();
  handleAppTermination();
};

export default initializeDatabase;