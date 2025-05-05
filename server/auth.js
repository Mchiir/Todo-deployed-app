const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    const authHeader = req.header('Authorization') // Get the Authorization header

    if (!authHeader) return res.status(401).json({ error: 'Access denied' }) // Check if token is present

    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1] // Extract the token without 'Bearer '
    } else {
        token = authHeader.trim()
    }

    try {
        const secret = process.env.JWT_SECRET || 'secret'
        console.log(secret)
        const decoded = jwt.verify(token, secret)
        req.user = decoded // Attach userId to request object
        next() // Continue to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: error.message })
    }
}

module.exports = { verifyToken }