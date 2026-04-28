const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "habitcents",
  // port: "3307",
});

db.connect((err) => {
  if (err) {
    console.log("Error found in database:", err);
  } else {
    console.log("MYSQL succesfully connected");
  }
});

module.exports = db;
