// Database connection configuration for Habitcents app
// This file sets up the connection to MySQL database

const mysql = require("mysql2"); // MySQL client library for Node.js

// Database connection configuration
const db = mysql.createConnection({
  host: "localhost", // Database server location
  user: "root", // Database username
  password: "", // Database password (empty for local development)
  database: "habitcents", // Name of the database to connect to
  // port: "3307", // Optional custom port (commented out uses default 3306)
});

// Attempt to connect to the database
db.connect((err) => {
  if (err) {
    // Log any connection errors
    console.log("Error found in database:", err);
  } else {
    // Confirm successful connection
    console.log("MYSQL succesfully connected");
  }
});

// Export the database connection for use in other files
module.exports = db;
