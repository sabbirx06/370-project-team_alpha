require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection(process.env.MYSQL_PUBLIC_URL);

db.connect((err) => {
  if (err) {
    console.log("Error found in database:", err);
  } else {
    console.log("MYSQL successfully connected");
  }
});

module.exports = db;
