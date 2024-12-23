import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';

import initializeDatabase from './config/db';
import authRoutes from '@routers/authRoutes';
import todoRoutes from '@routers/todoRoutes';

dotenv.config({ path: './src/.env' });

const app = express();
const PORT = process.env.PORT || 3000;
// Database connection
initializeDatabase()

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(authRoutes);
app.use(todoRoutes);

app.get('/', async (req: Request, res: Response) => {
    console.log('Index route');
    res.send('Index Route');
});

// // Start the server after the connection is established
// mongoose.connection.once('open', () => {
//     console.log('MongoDB connection established');
//     app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
// });

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})

export default app;