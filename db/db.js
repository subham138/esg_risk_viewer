const mysql = require("mysql");

// LOCAL //
// const db = mysql.createPool({
//   connectionLimit: 10,
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "esg_risk_viewer",
// });

// SERVER //
const db = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "Cloud#1851",
  database: "esg_risk_viewer",
});

db.getConnection((err, connection) => {
  if (err) console.log(err);
  connection.release();
  return;
});

module.exports = db;
