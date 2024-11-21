const mysql = require('mysql2/promise');

// Create and immediately connect to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: true // Ensures SSL is enabled
    }
});

db.then(() => {
    console.log("Database connected successfully.");
}).catch((err) => {
    console.error("Error connecting to SQL:", err);
});

module.exports = db;
