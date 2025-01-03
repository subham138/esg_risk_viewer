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
  I: "IFRS",
  IF: "IFRS-French",
  E: "ESRS",
  EF: "ESRS-French",
  G: "GRI",
  F: "GRI-French",
  EV: "ESRS VSME",
  EVF: "ESRS VSME-French",
  TNFD: "Taskforce on Nature-related Financial Disclosures",
  SECR: "Streamlined Energy and Carbon Reporting (SECR)",
  SFDR: "Sustainable Finance Disclosures Regulation (SFDR)",
  SDR: "UK\'s Sustainability Disclosure Requirements (SDR)",
  CFA: "CFA Institute's Diversity, Equity, & Inclusion Code",
  IC: "Carbon - Only",
  FC: "Carbon - Only (French)",
},
INPUT_TYPE_LIST = {
  radio: "R",
  check: "C",
  drop: "S",
  short_text: "I",
  act: "A",
  emi_type: "E",
  emi_unit: "U",
  mode: "Y",
},
SCOPE_LIST = [{id: 1, name: 'Scope 1', img: 'Scope_1_Icon.png'},{id: 2, name: 'Scope 2', img: 'Scope_2_Icon.png'},{id: 3, name: 'Scope 3', img: 'Scope_3_Icon.png'}],
PLATFORM_MODE = {C: 'Calculator', E: 'ESG Full'},
YEAR_LIST = [2024,2023,2022,2021,2020,2019],
FRAMEWORK_LIST = [
  { id: "I", name: "IFRS", key: "SQ%3D%3D", icon_name: "icon_I.png" },
  { id: "IF", name: "IFRS - French", key: "SUY%3D", icon_name: "icon_IF.png" },
  { id: "E", name: "ESRS", key: "RQ%3D%3D", icon_name: "icon_E.png" },
  { id: "EF", name: "ESRS - French", key: "RUY%3D", icon_name: "icon_EF.png" },
  { id: "EV", name: "ESRS VSME", key: "RVY%3D", icon_name: "icon_EV.png" },
  { id: "EVF", name: "ESRS VSME - French", key: "RVZG", icon_name: "icon_EVF.png" },
  { id: "G", name: "GRI", key: "Rw%3D%3D", icon_name: "icon_G.png" },
  { id: "F", name: "GRI - French", key: "Rg%3D%3D", icon_name: "icon_GF.png" },
];

module.exports = { db_Select, db_Insert, db_Delete, db_Check, USER_TYPE_LIST, CALCULATOR_LANG, PLAN_LIST, PROJECT_LIST, INPUT_TYPE_LIST, SCOPE_LIST, PLATFORM_MODE, YEAR_LIST, FRAMEWORK_LIST };