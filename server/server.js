require('dotenv').config({ path: './cridentials/.env' }); // Load environment variables
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const mongoose = require('./database/db'); // Import the exported connection

const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Import models
const Todo = require('./models/Todo');
const User = require('./models/User');

// Middleware
// app.use(cors({
//     origin: ['http://localhost:3000', 'https://todoapp-backend-xi.vercel.app'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
// }));

app.use(cors())
app.use(express.json())

// Routes
// Validate Token

const asyncWrapper = fn => (req, res, next) => {
    fn(req, res, next).catch(next);
};

app.post('/validate-token',  asyncWrapper(async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }
    console.log('Token Validation api received: ', {token})

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        res.status(200).json({ message: 'Token is valid', email: decoded.email });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token has expired' });
        } else {
            res.status(401).json({ message: 'Token is invalid', error: err.message });
        }
    }
}));

// Get all todos
app.get('/todos/:userEmail', asyncWrapper( async (req, res) => {
    const { userEmail } = req.params;
    if(userEmail){
        console.log('Todos get api received email:', {userEmail})
    }else{
        console.log('Please provide email.');
    }

    try {
        const todos = await Todo.find({ user_email: userEmail });
        res.json(todos);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch todos, ' + err.message});
    }
}));

// Create a new todo
app.post('/todos', asyncWrapper( async (req, res) => {
    const { user_email, title, progress, date } = req.body;
    if(user_email && title && progress && date){
        console.log('Todos create api received a new todo:', {title, progress, date});
    }else{
        res.status(401).json({ message:'Please provide complete valid data.' })
    }
    const id = uuidv4();

    try {
        const newTodo = new Todo({ id, user_email, title, progress, date });
        await newTodo.save();
        res.json(newTodo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create todo' });
    }
}));

// Edit a todo
app.put('/todos/:id', asyncWrapper( async (req, res) => {
    const { id } = req.params;
    const { user_email, title, progress, date } = req.body;
    if(user_email && title && progress && date){
        console.log('Todos update api received data:', {title, progress, date} , 'for user', {user_email})
    }else{
        res.status(401).json({ message:"Please give complete valid data." })
    }

    try {
        const updatedTodo = await Todo.findOneAndUpdate(
            { id },
            { user_email, title, progress, date },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ success: 'Todo updated successfully', updatedTodo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update todo' });
    }
}));

// Delete a todo
app.delete('/deleteTodo/:id', asyncWrapper( async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTodo = await Todo.findOneAndDelete({ id });

        if (!deletedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }else{
            console.log('Todo delete api received:', {id}, 'and deleted', {deletedTodo})
        }

        res.json({ success: 'Todo deleted successfully', deletedTodo });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to delete todo, '+ err.message});
    }
}));

// Signup
app.post('/signup', asyncWrapper(async (req, res) => {
    console.log('This is signup api')
    const { email, password } = req.body;

    console.log('Signup request received:', { email });

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    } console.log('User create api received new user:', {email})

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log('user already exists!')
        console.log(existingUser)
        // Generate JWT
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        // return existing user with a token
        return res.status(201).json({ message: 'User already exists', email: existingUser.email, token: token});
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({ email, hashed_password: hashedPassword });
    await newUser.save();
    console.log('New user saved:', { email });

    // Generate JWT
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Respond with success
    res.status(201).json({ email, token });
}));

// Login
app.post('/login', asyncWrapper( async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } console.log('User login api received user:', {email})

        const success = await bcrypt.compare(password, user.hashed_password);

        if (success) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
            return res.json({ email: user.email, token });
        } else {
            console.log('Given password does not match with stored hashed password.')
            return res.status(401).json({ detail: 'Login failed' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error, '+ err.message });
    }
}));

app.get('/', asyncWrapper( async (req, res) => {
    console.log("Indez route")
    res.send("Indez Route")
}));

// Start the server
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

module.exports = app;