const mysql = require("mysql");
require('dotenv').config()

// LOCAL //
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// SERVER //
// const db = mysql.createPool({
//   connectionLimit: 10,
//   host: "localhost",
//   user: "esg_risk_viewer",
//   password: "Cloud#1851",
//   database: "esg_risk_viewer",
// });

db.getConnection((err, connection) => {
  if (err) console.log(err);
  connection.release();
  return;
});

module.exports = db;
