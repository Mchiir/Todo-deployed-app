require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { graphqlHTTP } = require('express-graphql')
const { validate, specifiedRules, NoSchemaIntrospectionCustomRule } = require('graphql')
const { verifyToken } = require('./auth')

// GraphQL
const todoSchema = require('./graphql/todoSchema')
const userSchema = require('./graphql/userSchema')

const connectDB = require('./database/db'); // Import the exported connection

const { v4: uuidv4 } = require('uuid');

const app = express();

const PORT = process.env.SERVER_PORT || 3000;
const DB_URL = process.env.MONGO_URI || "mongodb://localhost:27017/todoapp";

// Import models
const Todo = require('./models/Todo');
const User = require('./models/User');

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://todo-app-client-umber-nine.vercel.app'],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
}));

// app.use(cors())
app.use(express.json())
// Routes
// Validate Token

const asyncWrapper = fn => (req, res, next) => {
    fn(req, res, next).catch(next);
};

app.use('/graphql/todos', verifyToken, graphqlHTTP((req) => ({
    schema: todoSchema,
    graphiql: process.env.APP_ENV !== 'production', // Enabled GraphiQL UI for testing
    validationRules:
        process.env.APP_ENV === 'production'
            ? [...specifiedRules, NoSchemaIntrospectionCustomRule]
            : specifiedRules
})))

app.use('/graphql/user', graphqlHTTP((req) => ({
    schema: userSchema,
    graphiql: process.env.APP_ENV !== 'production',
})))

app.post('/validate-token', asyncWrapper(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }
    // console.log('Token Validation api received: ', { token })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return res.status(200).json({ message: 'Token is valid', email: decoded.email });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else {
            return res.status(401).json({ message: 'Token is invalid' + err.message });
        }
    }
}));

// Get all todos
app.get('/todos', verifyToken, asyncWrapper(async (req, res) => {
    const { user_id } = req.user;
    /* 
    if (userEmail) {
        console.log('Todos get api received email:', { userEmail })
    } else {
        console.log('Please provide email.');
    } 
        */

    try {
        const todos = await Todo.find({ user: user_id });
        return res.status(200).json(todos);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to fetch todos: ' + err.message });
    }
}));

// Create a new todo
app.post('/todos', verifyToken, asyncWrapper(async (req, res) => {
    const { title, progress, date } = req.body;
    const { user_id } = req.user;

    if (!(user_id && title && progress && date)) {
        return res.status(409).json({ message: 'Please provide complete valid data.' });
    }

    try {
        const newTodo = new Todo({ user: user_id, title, progress, date });
        await newTodo.save();
        return res.status(201).json(newTodo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create todo' + err.message });
    }
}));

// Edit a todo
app.put('/todos/:id', verifyToken, asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { title, progress, date } = req.body;
    const { user_id } = req.user;

    if (!(user_id && title && progress && date)) {
        return res.status(401).json({ message: "Please give complete valid data." })
    }

    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            id,                       // id from req.params.id
            { user: user_id, title, progress, date },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.status(200).json({ success: 'Todo updated successfully', updatedTodo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update todo' + err.message });
    }
}));

// Delete a todo
app.delete('/deleteTodo/:id', verifyToken, asyncWrapper(async (req, res) => {
    const { id } = req.params;

    try {
        // const deletedTodo = await Todo.findOneAndDelete({ id });  using "id" field of Todo
        const deletedTodo = await Todo.findByIdAndDelete(id); // using id from req.params

        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.status(200).json({ success: 'Todo deleted successfully', deletedTodo });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to delete todo, ' + err.message });
    }
}));

// Signup
app.post('/signup', asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({ email, hashed_password: hashedPassword });
    await newUser.save();

    // Respond with success (but no token - user needs to login)
    res.status(201).json({
        message: 'Registration successful. Please login.',
        email
    });
}));

// Login
app.post('/login', asyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(409).json({ message: 'User with that email not found. please signup' }); // Generic message for security
        }

        const passwordMatch = await bcrypt.compare(password, user.hashed_password);
        if (!passwordMatch) {
            return res.status(409).json({ message: 'Input a correct password' });
        }

        const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        res.status(200).json({ email: user.email, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Internal server error, ' + err.message });
    }
}));

app.get('/', asyncWrapper(async (req, res) => {
    // console.log("Indez route")
    res.send("Indez Route")
}));

// Start the database, then server
connectDB(DB_URL)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        })
    })
    .catch((err) => {
        console.error('Startup failed:', err.message);
        process.exit(1);
    })

module.exports = app;
