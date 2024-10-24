const db = require("../db/db");
// const dateFormat = require("dateformat");

const db_Select = (select, table_name, whr, order) => {
  var tb_whr = whr ? `WHERE ${whr}` : "";
  var tb_order = order ? order : "";
  let sql = `SELECT ${select} FROM ${table_name} ${tb_whr} ${tb_order}`;
  // console.log(sql);
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        data = { suc: 0, msg: JSON.stringify(err) };
      } else {
        data = { suc: 1, msg: result, sql };
      }
      resolve(data);
    });
  });
};

const db_Insert = (table_name, fields, values, whr, flag) => {
  var sql = "",
    msg = "",
    tb_whr = whr ? `WHERE ${whr}` : "";
  // 0 -> INSERT; 1 -> UPDATE
  // IN INSERT flieds ARE TABLE COLOUMN NAME ONLY || IN UPDATE fields ARE TABLE NAME = VALUES
  if (flag > 0) {
    sql = `UPDATE ${table_name} SET ${fields} ${tb_whr}`;
    msg = "Updated Successfully !!";
  } else {
    sql = `INSERT INTO ${table_name} ${fields} VALUES ${values}`;
    msg = "Inserted Successfully !!";
  }
  // console.log(sql);
  return new Promise((resolve, reject) => {
    db.query(sql, (err, lastId) => {
      if (err) {
        console.log(err);
        data = { suc: 0, msg: JSON.stringify(err) };
      } else {
        data = { suc: 1, msg: msg, lastId };
      }
      resolve(data);
    });
  });
};

const db_Delete = (table_name, whr) => {
  whr = whr ? `WHERE ${whr}` : "";
  var sql = `DELETE FROM ${table_name} ${whr}`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, lastId) => {
      if (err) {
        console.log(err);
        data = { suc: 0, msg: JSON.stringify(err) };
      } else {
        data = { suc: 1, msg: "Deleted Successfully !!" };
      }
      resolve(data);
    });
  });
};

const db_Check = async (fields, table_name, whr) => {
  var sql = `SELECT ${fields} FROM ${table_name} WHERE ${whr}`;
  // console.log(sql);
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        data = { suc: 0, msg: JSON.stringify(err) };
      } else {
        data = { suc: 1, msg: result.length };
      }
      resolve(data);
    });
  });
};

const USER_TYPE_LIST = {
  'S': 'Super Admin',
  'C': 'Client',
  'A': 'Admin User',
  'V': 'Viewer',
  'E': 'Editor'
},
CALCULATOR_LANG = {
  'B': 'Both',
  'E': 'English',
  'F': 'French'
},
PLAN_LIST = {
  'N': 'None', 'B': 'Basic', 'S': 'Standard', 'P': 'Premium'
},
PROJECT_LIST = {
  'I': 'IFRS', 'IF': 'IFRS-French', 'E': 'ESRS', 'EF': 'ESRS-French', 'G': 'GRI', 'F': 'GRI-French', 'EV': 'ESRS VSME', 'EVF': 'ESRS VSME-French'	
},
INPUT_TYPE_LIST = {
  radio: "R",
  check: "C",
  drop: "S",
  short_text: "I",
  act: "A",
  emi_type: "E",
  emi_unit: "U",
},
SCOPE_LIST = [{id: 1, name: 'Scope 1', img: 'carbon-neutral.png'},{id: 2, name: 'Scope 2', img: 'industrial-emissions.png'},{id: 3, name: 'Scope 3', img: 'carbon-neutral_3.png'}],
PLATFORM_MODE = {C: 'Calculator', E: 'ESG Full'};

module.exports = { db_Select, db_Insert, db_Delete, db_Check, USER_TYPE_LIST, CALCULATOR_LANG, PLAN_LIST, PROJECT_LIST, INPUT_TYPE_LIST, SCOPE_LIST, PLATFORM_MODE };