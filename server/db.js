require('dotenv').config({ path:'./.env' })
const mysql = require('mysql2')
// const Pool = require('pg') // for Postgresql db conn

const conn = mysql.createConnection({
  host: process.env.HOST2,
  user: process.env.USER,
  password : process.env.PASSWORD2,
  database: process.env.DATABASE2,
  port: process.env.DBPORT || 3306
})
  
  conn.connect(function(err) {
    if (err) throw err
    console.log("Connected!")
  })

    // Remember to close the connection when done
    // connection.end();


module.exports = conn