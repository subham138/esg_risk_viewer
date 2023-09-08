const express = require("express"),
  DataCollectionRouter = express.Router(),
  dateFormat = require("dateformat");

const { getSectorList, getIndustriesList } = require("../modules/AdminModule");
const {
  getSusDiscList,
  getActMetrialDtls,
} = require("../modules/DataCollectionModule");
const { db_Insert, db_Select } = require("../modules/MasterModule");

DataCollectionRouter.get("/sus_disc", async (req, res) => {
  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(),
    ind_list = { msg: [] };
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id);
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Sustainability Disclosure Topics & Metrics",
  };
  res.render("data_collection/sus_disc", data);
});

DataCollectionRouter.post("/save_sus_disc", async (req, res) => {
  var data = req.body,
    res_dt,
    user = "admin",
    datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  for (let dt of data.top_id) {
    // console.log(dt);
    var j = 1;
    // console.log(Array.isArray(data[`metric_${dt}`]));
    if (Array.isArray(data[`metric_${dt}`])) {
      for (let i = 0; i < data[`metric_${dt}`].length; i++) {
        var chk_whr = `sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND sl_no = ${j}`;
        var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);

        var table_name = `td_sus_dis_top_met`,
          fields =
            chk_dt.suc > 0 && chk_dt.msg.length > 0
              ? `top_id = '${dt}', metric = '${
                  data[`metric_${dt}`][i]
                }', catg = '${data[`catg_${dt}`][i]}', unit = '${
                  data[`unit_${dt}`][i]
                }', code = '${
                  data[`code_${dt}`][i]
                }', modified_by= '${user}', modified_dt = '${datetime}'`
              : "(sec_id, ind_id, top_id, sl_no, metric, catg, unit, code, created_by, created_dt)",
          values = `('${data.sec_id}', '${data.ind_id}', '${dt}', '${j}', '${
            data[`metric_${dt}`][i]
          }', '${data[`catg_${dt}`][i]}', '${data[`unit_${dt}`][i]}', '${
            data[`code_${dt}`][i]
          }', '${user}', '${datetime}')`,
          whr =
            chk_dt.suc > 0 && chk_dt.msg.length > 0
              ? `id = '${chk_dt.msg[0].id}'`
              : null,
          flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
        res_dt = await db_Insert(table_name, fields, values, whr, flag);
        j++;
      }
    } else {
      var chk_whr = `sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND sl_no = ${j}`;
      var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);
      console.log(chk_dt);
      var table_name = `td_sus_dis_top_met`,
        fields =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `top_id = '${dt}', metric = '${data[`metric_${dt}`]}', catg = '${
                data[`catg_${dt}`]
              }', unit = '${data[`unit_${dt}`]}', code = '${
                data[`code_${dt}`]
              }', modified_by= '${user}', modified_dt = '${datetime}'`
            : "(sec_id, ind_id, top_id, sl_no, metric, catg, unit, code, created_by, created_dt)",
        values = `('${data.sec_id}', '${data.ind_id}', '${dt}', '${j}', '${
          data[`metric_${dt}`]
        }', '${data[`catg_${dt}`]}', '${data[`unit_${dt}`]}', '${
          data[`code_${dt}`]
        }', '${user}', '${datetime}')`,
        whr =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `id = '${chk_dt.msg[0].id}'`
            : null,
        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
      res_dt = await db_Insert(table_name, fields, values, whr, flag);
    }
  }
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect(`/sus_disc?sec_id=${data.sec_id}&ind_id=${data.ind_id}`);
});

DataCollectionRouter.get("/sus_disc_ajax", async (req, res) => {
  var data = req.query;
  var res_dt = await getSusDiscList(data.sec_id, data.ind_id, 0);
  res_dt = {
    suc: res_dt.suc > 0 ? (res_dt.msg.length > 0 ? 1 : 2) : res_dt.suc,
    msg: res_dt.msg,
  };
  res.send(res_dt);
});

DataCollectionRouter.get("/act_metric", async (req, res) => {
  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(),
    ind_list = { msg: [] };
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id);
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Activity Metrics",
  };
  res.render("data_collection/act_metric", data);
});

DataCollectionRouter.post("/save_act_metric", async (req, res) => {
  var data = req.body,
    res_dt,
    user = "admin",
    datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  let j = 1;
  if (Array.isArray(data.act_metric)) {
    for (let i = 0; i < data.act_metric.length; i++) {
      var chk_whr = `sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND sl_no = ${j}`;
      var chk_dt = await db_Select("id", "td_act_metrics", chk_whr, null);

      var table_name = `td_act_metrics`,
        fields =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `act_metric = '${data.act_metric[i]}', catg = '${data.catg[i]}', unit = '${data.unit[i]}', code = '${data.code[i]}', modified_by= '${user}', modified_dt = '${datetime}'`
            : "(sec_id, ind_id, sl_no, act_metric, catg, unit, code, created_by, created_dt)",
        values = `('${data.sec_id}', '${data.ind_id}', '${j}', '${data.act_metric[i]}', '${data.catg[i]}', '${data.unit[i]}', '${data.code[i]}', '${user}', '${datetime}')`,
        whr =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `id = '${chk_dt.msg[0].id}'`
            : null,
        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
      res_dt = await db_Insert(table_name, fields, values, whr, flag);
      j++;
    }
  } else {
    var chk_whr = `sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND sl_no = ${j}`;
    var chk_dt = await db_Select("id", "td_act_metrics", chk_whr, null);

    var table_name = `td_act_metrics`,
      fields =
        chk_dt.suc > 0 && chk_dt.msg.length > 0
          ? `act_metric = '${data.act_metric}', catg = '${data.catg}', unit = '${data.unit}', code = '${data.code}', modified_by= '${user}', modified_dt = '${datetime}'`
          : "(sec_id, ind_id, sl_no, act_metric, catg, unit, code, created_by, created_dt)",
      values = `('${data.sec_id}', '${data.ind_id}', '${j}', '${data.act_metric}', '${data.catg}', '${data.unit}', '${data.code}', '${user}', '${datetime}')`,
      whr =
        chk_dt.suc > 0 && chk_dt.msg.length > 0
          ? `id = '${chk_dt.msg[0].id}'`
          : null,
      flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
    res_dt = await db_Insert(table_name, fields, values, whr, flag);
  }

  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect(`/act_metric?sec_id=${data.sec_id}&ind_id=${data.ind_id}`);
  // res.send(res_dt)
});

DataCollectionRouter.get("/get_act_metric_ajax", async (req, res) => {
  var data = req.query;
  var res_dt = await getActMetrialDtls(data.sec_id, data.ind_id);
  res_dt = {
    suc: res_dt.suc > 0 ? (res_dt.msg.length > 0 ? 1 : 2) : res_dt.suc,
    msg: res_dt.msg,
  };
  res.send(res_dt);
});

DataCollectionRouter.get("/dynamic_entry", async (req, res) => {
  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(),
    ind_list = { msg: [] };
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id);
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Sustainability Disclosure Topics & Metrics",
  };
  res.render("data_collection/dynamic_form/entry", data);
});

DataCollectionRouter.get("/save_dynamic_entry", (req, res) => {
  // var data = req.body
  var data = {
    header_1: "Summary",
    textarea_1:
      "Colleges and universities are frequent and compelling targets for cyber criminals. The industry may face data security risks due to the large number of personal records processed and stored, the mix of intellectual property and personally identifiable information held (e.g., social security numbers, vaccination records, and other information required for admission), and the open, collaborative environment of many campuses. The exposure of sensitive information through cybersecurity breaches, other malicious activities, or student negligence may result in significant social externalities such as identity fraud and theft. Data breaches may compromise public perception of the effectiveness of a school’s security measures, which could result in reputational damage and difficulty in attracting and retaining students, as well as significant costs to fix the consequences of a breach and prevent future breaches. Enhanced disclosure on the number and nature of security breaches, management strategies to address these risks, and policies and procedures to protect student information will allow shareholders to understand the effectiveness of management strategies that schools employ regarding this issue.",
    header_2: "Risks and Opportunities",
    textarea_2:
      "• Loss of revenue or unanticipated remediation and litigation costs in the event of a data breach or misuse. \r\n• Damage to reputation in the event of a breach or controversy over how data is used. \r\n• Loss of significant market or forced change in business model if regulatory action restricts how companies may use data. \r\n• Increased costs to comply with new or evolving regulations.\r\n",
    header_3: "Exposure",
    sub_header_3: "Cost of Data breach by country or region (USD millions)",
    table_3_heading: ["", "2022", "2023"],
    table_3_body: [
      "United States",
      "9.44",
      "9.48",
      "Middle East",
      "7.46",
      "8.07",
      "Canada",
      "5.64",
      "5.13",
      "Germany",
      "4.85",
      "4.67",
    ],
    sub_header_4: "Cost of a data breach by industry (USD millions)",
    table_4_heading: ["", "2020", "2021", "2022", "2023"],
    table_4_body: [
      "Healthcare",
      "7.13",
      "9.23",
      "10.1",
      "10.93",
      "Financial",
      "5.85",
      "5.72",
      "5.97",
      "5.9",
      "Pharmaceuticals",
      "5.06",
      "5.04",
      "5.01",
      "4.82",
      "Technology",
      "5.04",
      "4.88",
      "4.97",
      "4.66",
    ],
    sec_id: ["4", "4", "3", "3", "3", "2", "2", "1", "1"],
  };
  data.sec_id = [...new Set(data.sec_id)].sort();

  var table_row = [],
    row = [];
  let j = 1;
  // console.log(data.table_4_heading.length);
  for (let dt of data.table_4_body) {
    if (j <= data.table_4_heading.length) {
      row.push(dt);
    } else {
      j = 1;
      table_row.push({...row});
      row.length = 0;
      row.push(dt);
    }
      j++;
  }
  console.log(table_row);
  res.send(data);
});

module.exports = { DataCollectionRouter };
