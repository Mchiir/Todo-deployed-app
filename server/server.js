require('dotenv').config({ path:'./.env' })
const PORT = process.env.PORT ?? 3000
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const app = express()
const conn = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(cors())
app.use(express.json())

//validate token
app.post('/validate-token', (req, res) => {
    const { token } = req.body

    if (!token) {
        return res.status(401).json({ message: 'Token required' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')

        res.status(200).json({ message: 'Token is valid', email: decoded.email })
    } catch (err) {
        if (err.message == 'jwt expired'){
            res.status(401).json({ message: 'Token has expired'})
        }else{
            res.status(401).json({ message: 'Token is invalid'})
        }
    }
})

//get all todos
app.get('/todos/:userEmail', async (req, res) => {
    const { userEmail } = req.params

    // Use a prepared statement with a placeholder for the parameter
    const query = 'SELECT * FROM todos WHERE user_email = ?'

    // Execute the query
    conn.query(query, [userEmail], (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Database query failed' })
        }
        res.json(results)
    })
})

// create a new todo
app.post('/todos', (req, res) => {

    const { user_email, title, progress, date } = req.body
    const id = uuidv4()
    try {
        console.log(user_email, title, progress, date);
        const query = "INSERT INTO todos(id, user_email, title, progress, date) VALUES (?, ?, ?, ?, ?)"

        conn.query(query, [id, user_email, title, progress, date], (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: 'Database query failed' })
            }

            res.json(results)
        })
    } catch (error) {
        console.error(error)

    }
})

// edit a new todo
app.put('/todos/:id', (req, res) => {
    const { id } = req.params
    const { user_email, title, progress, date } = req.body
    console.log({ user_email, title, progress, date, id })

    try {
        const query = "UPDATE todos SET user_email=?, title=?, progress=?, date=? WHERE id=?"

        conn.query(query, [user_email, title, progress, date, id], (err, results) => {
            if (err) {
                console.log(err)
                res.status(500).json({ error: "Database query failed to update data" })
            }

            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'No todo match your search' })
            }
            res.json({ Success: "Todo updated successfully", rowsAffected: results.affectedRows })
        })

    } catch (err) {
        console.log(err)
    }
})

// delete a new todo
app.delete('/deleteTodo/:id', (req, res) => {
    const { id } = req.params
    console.log(id)

    try {
        const query = "DELETE FROM todos WHERE id=?"
        conn.query(query, [id], (err, results) => {
            if (err) {
                res.status(500).json({ Error: "Database query failed to delete todo" })
            }
            res.json(results)
        })
    } catch (err) {
        console.error(err)
    }
})

// signup
app.post('/signup', async (req, res) => {
    const { email, password } = req.body
    const salt = bcrypt.genSaltSync(10)

    const hashedPassword = bcrypt.hashSync(password, salt)

    console.log("Data passed:", email, password, hashedPassword)
    try {
        const query = "INSERT INTO users (email, hashed_password) VALUES (?, ?)"

        conn.query(query, [email, hashedPassword], (err, results) => {
            if (err) {
                res.status(500).json({ error: "Database query failed." })
                console.log(err)
            }

            const token = jwt.sign({ email }, 'secret', { expiresIn: '5s' })
            res.json({ email, token })
        })
    } catch (err) {
        console.error(err)
        if (err) {
            res.json({ detail: err.detail })
        }
    }
})

//login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Data passed:", email, password);

    try {
        const query = "SELECT * FROM users WHERE email = ?";

        conn.query(query, [email], async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ Error: "Server error with login!", err: err });
            }

            if (results.length === 0) {
                return res.status(404).json({ Error: 'User not found!' });
            }

            const user = results[0];  // Get the user object from the results
            const success = await bcrypt.compare(password, user.hashed_password);

            if (success) {
                const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1hr' });
                return res.json({ email: user.email, token });
            } else {
                return res.status(401).json({ detail: "Login failed" });
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error", detail: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))