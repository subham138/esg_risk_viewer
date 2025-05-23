const express = require("express"),
  DataCollectionRouter = express.Router(),
  dateFormat = require("dateformat"),
  fs = require("fs"),
  path = require("path");

const {
  getSectorList,
  getIndustriesList,
  getTopicList,
} = require("../modules/AdminModule");
const {
  getSusDiscList,
  getActMetrialDtls,
  getDynamicData,
  getSusDisTopCodeList,
  getWordInfo,
  saveWordInfo,
  getCopyLatestWordInfoSet,
  getRiskOprnDtls,
  getDataPointList,
  getDataPoint,
} = require("../modules/DataCollectionModule");
const { db_Insert, db_Select, db_Delete, PROJECT_LIST } = require("../modules/MasterModule");

DataCollectionRouter.use((req, res, next) => {
  var user = req.session.user;
  if (user) {
    next();
  } else {
    res.redirect("/login");
  }
});

DataCollectionRouter.get("/sus_disc", async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();

  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(0, flag),
    ind_list = { msg: [] };
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id, flag);
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Sustainability Disclosure Topics & Metrics",
    flag,
    enc_dt,
  };
  res.render("data_collection/sus_disc", data);
});

DataCollectionRouter.post("/save_sus_disc", async (req, res) => {
  var data = req.body,
    res_dt,
    user = "admin",
    datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  // console.log(data);
  if (Array.isArray(data.top_id)) {
    for (let dt of data.top_id) {
      // console.log(dt);
      var j = 1;
      // console.log(Array.isArray(data[`metric_${dt}`]));
      if (Array.isArray(data[`metric_${dt}`])) {
        for (let i = 0; i < data[`metric_${dt}`].length; i++) {
          var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND sl_no = ${j}`;
          var chk_dt = await db_Select(
            "id",
            "td_sus_dis_top_met",
            chk_whr,
            null
          );

          var table_name = `td_sus_dis_top_met`,
            fields =
              chk_dt.suc > 0 && chk_dt.msg.length > 0
                ? `top_id = '${dt}', ind_agn = '${
                    data[`ind_agn_${dt}`][i]
                  }', metric = '${data[`metric_${dt}`][i]}', catg = '${
                    data[`catg_${dt}`][i]
                  }', unit = '${data[`unit_${dt}`][i]}', code = '${
                    data[`code_${dt}`][i]
                  }', words = '${
                    data[`words_${dt}`][i]
                  }', modified_by= '${user}', modified_dt = '${datetime}'`
                : "(repo_flag, sec_id, ind_id, top_id, sl_no, ind_agn, metric, catg, unit, code, words, created_by, created_dt)",
            values = `('${data.flag}', '${data.sec_id}', '${
              data.ind_id
            }', '${dt}', '${j}', '${data[`ind_agn_${dt}`][i]}', '${
              data[`metric_${dt}`][i]
            }', '${data[`catg_${dt}`][i]}', '${data[`unit_${dt}`][i]}', '${
              data[`code_${dt}`][i]
            }', '${data[`words_${dt}`][i]}', '${user}', '${datetime}')`,
            whr =
              chk_dt.suc > 0 && chk_dt.msg.length > 0
                ? `id = '${chk_dt.msg[0].id}'`
                : null,
            flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
          res_dt = await db_Insert(table_name, fields, values, whr, flag);
          j++;
        }
      } else {
        var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND sl_no = ${j}`;
        var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);
        // console.log(chk_dt);
        var table_name = `td_sus_dis_top_met`,
          fields =
            chk_dt.suc > 0 && chk_dt.msg.length > 0
              ? `top_id = '${dt}', ind_agn = '${
                  data[`ind_agn_${dt}`]
                }', metric = '${data[`metric_${dt}`]}', catg = '${
                  data[`catg_${dt}`]
                }', unit = '${data[`unit_${dt}`]}', code = '${
                  data[`code_${dt}`]
                }', words = '${
                  data[`words_${dt}`]
                }', modified_by= '${user}', modified_dt = '${datetime}'`
              : "(repo_flag, sec_id, ind_id, top_id, sl_no, ind_agn, metric, catg, unit, code, words, created_by, created_dt)",
          values = `('${data.flag}', '${data.sec_id}', '${
            data.ind_id
          }', '${dt}', '${j}', '${data[`ind_agn_${dt}`]}', '${
            data[`metric_${dt}`]
          }', '${data[`catg_${dt}`]}', '${data[`unit_${dt}`]}', '${
            data[`code_${dt}`]
          }', '${data[`words_${dt}`]}', '${user}', '${datetime}')`,
          whr =
            chk_dt.suc > 0 && chk_dt.msg.length > 0
              ? `id = '${chk_dt.msg[0].id}'`
              : null,
          flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
        res_dt = await db_Insert(table_name, fields, values, whr, flag);
      }
    }
  } else {
    var dt = data.top_id;
    var j = 1;
    if (Array.isArray(data[`metric_${dt}`])) {
      for (let i = 0; i < data[`metric_${dt}`].length; i++) {
        var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND sl_no = ${j}`;
        var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);

        var table_name = `td_sus_dis_top_met`,
          fields =
            chk_dt.suc > 0 && chk_dt.msg.length > 0
              ? `top_id = '${dt}', ind_agn = '${
                  data[`ind_agn_${dt}`][i]
                }', metric = '${data[`metric_${dt}`][i]}', catg = '${
                  data[`catg_${dt}`][i]
                }', unit = '${data[`unit_${dt}`][i]}', code = '${
                  data[`code_${dt}`][i]
                }', words = '${
                  data[`words_${dt}`][i]
                }', modified_by= '${user}', modified_dt = '${datetime}'`
              : "(repo_flag, sec_id, ind_id, top_id, sl_no, ind_agn, metric, catg, unit, code, words, created_by, created_dt)",
          values = `('${data.flag}', '${data.sec_id}', '${
            data.ind_id
          }', '${dt}', '${j}', '${data[`ind_agn_${dt}`][i]}', '${
            data[`metric_${dt}`][i]
          }', '${data[`catg_${dt}`][i]}', '${data[`unit_${dt}`][i]}', '${
            data[`code_${dt}`][i]
          }', '${data[`words_${dt}`][i]}', '${user}', '${datetime}')`,
          whr =
            chk_dt.suc > 0 && chk_dt.msg.length > 0
              ? `id = '${chk_dt.msg[0].id}'`
              : null,
          flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
        res_dt = await db_Insert(table_name, fields, values, whr, flag);
        j++;
      }
    } else {
      var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND sl_no = ${j}`;
      var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);
      // console.log(chk_dt);
      var table_name = `td_sus_dis_top_met`,
        fields =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `top_id = '${dt}', ind_agn = '${
                data[`ind_agn_${dt}`]
              }', metric = '${data[`metric_${dt}`]}', catg = '${
                data[`catg_${dt}`]
              }', unit = '${data[`unit_${dt}`]}', code = '${
                data[`code_${dt}`]
              }', words = '${
                data[`words_${dt}`]
              }', modified_by= '${user}', modified_dt = '${datetime}'`
            : "(repo_flag, sec_id, ind_id, top_id, sl_no, ind_agn, metric, catg, unit, code, words, created_by, created_dt)",
        values = `('${data.flag}', '${data.sec_id}', '${
          data.ind_id
        }', '${dt}', '${j}', '${data[`ind_agn_${dt}`]}', '${
          data[`metric_${dt}`]
        }', '${data[`catg_${dt}`]}', '${data[`unit_${dt}`]}', '${
          data[`code_${dt}`]
        }', '${data[`words_${dt}`]}', '${user}', '${datetime}')`,
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
  res.redirect(
    `/sus_disc?sec_id=${data.sec_id}&ind_id=${
      data.ind_id
    }&flag=${encodeURIComponent(new Buffer.from(data.flag).toString("base64"))}`
  );
});

DataCollectionRouter.get("/sus_disc_ajax", async (req, res) => {
  var data = req.query;
  var res_dt = await getSusDiscList(data.sec_id, data.ind_id, 0, data.flag);
  res_dt = {
    suc: res_dt.suc > 0 ? (res_dt.msg.length > 0 ? 1 : 2) : res_dt.suc,
    msg: res_dt.msg,
  };
  res.send(res_dt);
});

DataCollectionRouter.post("/sus_disc_del_ajax", async (req, res) => {
  var data = req.body;
  var res_dt = await db_Delete("td_sus_dis_top_met", `id = ${data.id}`);
  res.send(res_dt);
});

DataCollectionRouter.get("/act_metric", async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();

  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(0, flag),
    ind_list = { msg: [] };
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id, flag);
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Activity Metrics",
    flag,
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
      var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND sl_no = ${j}`;
      var chk_dt = await db_Select("id", "td_act_metrics", chk_whr, null);

      var table_name = `td_act_metrics`,
        fields =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `act_metric = '${data.act_metric[i]}', catg = '${data.catg[i]}', unit = '${data.unit[i]}', code = '${data.code[i]}', modified_by= '${user}', modified_dt = '${datetime}'`
            : "(repo_flag, sec_id, ind_id, sl_no, act_metric, catg, unit, code, created_by, created_dt)",
        values = `('${data.flag}', '${data.sec_id}', '${data.ind_id}', '${j}', '${data.act_metric[i]}', '${data.catg[i]}', '${data.unit[i]}', '${data.code[i]}', '${user}', '${datetime}')`,
        whr =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `id = '${chk_dt.msg[0].id}'`
            : null,
        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
      res_dt = await db_Insert(table_name, fields, values, whr, flag);
      j++;
    }
  } else {
    var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND sl_no = ${j}`;
    var chk_dt = await db_Select("id", "td_act_metrics", chk_whr, null);

    var table_name = `td_act_metrics`,
      fields =
        chk_dt.suc > 0 && chk_dt.msg.length > 0
          ? `act_metric = '${data.act_metric}', catg = '${data.catg}', unit = '${data.unit}', code = '${data.code}', modified_by= '${user}', modified_dt = '${datetime}'`
          : "(repo_flag, sec_id, ind_id, sl_no, act_metric, catg, unit, code, created_by, created_dt)",
      values = `('${data.flag}', '${data.sec_id}', '${data.ind_id}', '${j}', '${data.act_metric}', '${data.catg}', '${data.unit}', '${data.code}', '${user}', '${datetime}')`,
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
  res.redirect(
    `/act_metric?sec_id=${data.sec_id}&ind_id=${
      data.ind_id
    }&flag=${encodeURIComponent(new Buffer.from(data.flag).toString("base64"))}`
  );
  // res.send(res_dt)
});

DataCollectionRouter.get("/get_act_metric_ajax", async (req, res) => {
  var data = req.query;
  var res_dt = await getActMetrialDtls(data.sec_id, data.ind_id, data.flag);
  res_dt = {
    suc: res_dt.suc > 0 ? (res_dt.msg.length > 0 ? 1 : 2) : res_dt.suc,
    msg: res_dt.msg,
  };
  res.send(res_dt);
});

DataCollectionRouter.get("/dynamic_entry_view", async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();

  var req_data = req.query;
  var dynamic_data = await getDynamicData(0, 0, 0, 0, flag);
  var data = {
    dynamic_data,
    header: "Dynamic Data List",
    flag,
    enc_dt,
  };
  res.render("data_collection/dynamic_form/view", data);
});

DataCollectionRouter.get("/dynamic_entry", async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();

  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(0, flag),
    ind_list = { msg: [] };
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id, flag);
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Date Collection",
    flag,
  };
  res.render("data_collection/dynamic_form/entry", data);
});

DataCollectionRouter.post("/save_dynamic_entry", async (req, res) => {
  var data = req.body,
    user = "admin",
    datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

  data.section_id = [...new Set(data.section_id)].sort();

  var table_row = [],
    row = [],
    dynamic_data = [];

  // console.log(data)

  for (let dt of data.section_id) {
    var dynamic_data_obj = {};
    dynamic_data_obj["heading"] = data[`header_${dt}`]
      ? data[`header_${dt}`]
      : null;
    dynamic_data_obj["sub_heading"] = data[`sub_header_${dt}`]
      ? data[`sub_header_${dt}`]
      : null;
    dynamic_data_obj["textarea"] = data[`textarea_${dt}`]
      ? data[`textarea_${dt}`]
      : null;
    dynamic_data_obj["icon"] = data[`icoType_${dt}`]
      ? data[`icoType_${dt}`]
      : null;
    if (data[`table_${dt}_heading`] && data[`table_${dt}_body`]) {
      let j = 1;
      table_row.length = 0;
      row.length = 0;

      const chunkSize = data[`table_${dt}_heading`].length;
      for (let i = 0; i < data[`table_${dt}_body`].length; i += chunkSize) {
        const chunk = data[`table_${dt}_body`].slice(i, i + chunkSize);
        table_row.push({ ...chunk });
      }
      // console.log(table_row);
      dynamic_data_obj["table"] = {
        head: data[`table_${dt}_heading`],
        body: [...table_row],
        graph_type: data[`chartType_${dt}`],
      };
    }
    dynamic_data.push(dynamic_data_obj);
  }
  var year = dateFormat(new Date(), "yyyy"),
    file_name = `${data.flag}_${data.sec_id}_${data.ind_id}_${data.top_id}_${year}.json`;
  fs.writeFileSync(
    path.join(__dirname, "../dynamic_data_set", file_name),
    JSON.stringify(dynamic_data),
    "utf-8"
  );

  var chk_dt = await db_Select(
    "id",
    "td_data_collection",
    `repo_flag = '${data.flag}' AND dt_year = '${year}' AND sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = '${data.top_id}'`,
    null
  );

  var fields =
      chk_dt.suc > 0 && chk_dt.msg.length > 0
        ? `data_file_name = '${file_name}', modified_by = '${user}', modified_dt = '${datetime}'`
        : `(repo_flag, dt_year, sec_id, ind_id, top_id, data_file_name, created_by, created_dt)`,
    values = `('${data.flag}', '${year}', '${data.sec_id}', '${data.ind_id}', '${data.top_id}', '${file_name}', '${user}', '${datetime}')`,
    whr =
      chk_dt.suc > 0 && chk_dt.msg.length > 0
        ? `id = '${chk_dt.msg[0].id}'`
        : null,
    flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
  var res_dt = await db_Insert("td_data_collection", fields, values, whr, flag);
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect(
    `/dynamic_entry_view?flag=${encodeURIComponent(
      new Buffer.from(data.flag).toString("base64")
    )}`
  );
  // res.send(res_dt);
});

DataCollectionRouter.get("/dynamic_data_view", async (req, res) => {
  var data = req.query;
  var resDt = await getDynamicData(data.id);
  var dataSet = resDt;
  if (resDt.suc > 0 && resDt.msg.length > 0) {
    if (resDt.msg[0].data_file_name) {
      try {
        resDt = fs.readFileSync(
          path.join("dynamic_data_set", resDt.msg[0].data_file_name),
          "utf-8"
        );
        resDt = JSON.parse(resDt);
      } catch (err) {
        console.log(err);
        resDt = [];
      }
      // console.log(resDt);
      // resDt = require(`../dynamic_data_set/${resDt.msg[0].data_file_name}`)
    }
  }
  var data = {
    resDt,
    dataSet,
    header: "Date Collection View",
  };
  res.render("data_collection/dynamic_form/data_view", data);
});

DataCollectionRouter.get("/dynamic_edit", async (req, res) => {
  var selected = {
    id: req.query.id ? req.query.id : 0,
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var resDt;
  var dataSet = { suc: 0, msg: [] },
    topList = { suc: 0, msg: [] };
  var sec_data = await getSectorList(),
    ind_list = { msg: [] };
  if (selected.id > 0) {
    resDt = await getDynamicData(selected.id);
    ind_list = await getIndustriesList(null, resDt.msg[0].sec_id);
    topList = await getIndustriesList(
      resDt.suc > 0 ? resDt.msg[0].ind_id : null,
      resDt.msg[0].sec_id
    );
    // console.log(topList);
    dataSet = resDt;
    if (resDt.suc > 0 && resDt.msg.length > 0) {
      if (resDt.msg[0].data_file_name) {
        try {
          resDt = fs.readFileSync(
            path.join("dynamic_data_set", resDt.msg[0].data_file_name),
            "utf-8"
          );
          resDt = JSON.parse(resDt);
        } catch (err) {
          console.log(err);
          resDt = [];
        }
        // console.log(resDt);
        // resDt = require(`../dynamic_data_set/${resDt.msg[0].data_file_name}`)
      }
    }
  }
  // console.log(resDt);
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    resDt,
    dataSet: dataSet.suc > 0 ? dataSet.msg : [],
    topList: topList.suc > 0 ? topList.msg : [],
    header: "Date Collection Edit",
  };
  res.render("data_collection/dynamic_form/edit", data);
});

DataCollectionRouter.get("/get_dynamic_data_set_ajax", async (req, res) => {
  var file_name = req.query.filePath;
  try {
    fs.readFile(
      path.join("dynamic_data_set", file_name),
      "utf-8",
      (err, data) => {
        if (err) res.send([]);
        else res.send(JSON.parse(data));
      }
    );
  } catch (err) {
    console.log(err);
    res.send([]);
  }
});

DataCollectionRouter.get("/sus_disc_info", async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();

  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(0, flag),
    ind_list = { msg: [] };
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id, flag);
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Sustainability Disclosure Topics & Metrics User Guide Information",
    flag,
    enc_dt,
  };
  res.render("data_collection/sus_disc/sus_disc_info", data);
});

DataCollectionRouter.post("/save_sus_disc_info", async (req, res) => {
  var data = req.body,
    res_dt = { suc: 1, msg: "" },
    user = "admin",
    datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  // console.log(data);
  if (Array.isArray(data.top_id)) {
    for (let dt of data.top_id) {
      // console.log(dt);
      var j = 1;
      // console.log(Array.isArray(data[`metric_${dt}`]));
      if (Array.isArray(data[`code_${dt}`])) {
        for (let i = 0; i < data[`code_${dt}`].length; i++) {
          if (data[`info_title_${dt}`][i] != "") {
            var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${
              data.sec_id
            }' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND code = '${
              data[`code_${dt}`][i]
            }'`;
            // var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);

            var table_name = `td_sus_dis_top_met`,
              fields = `info_title = "${
                data[`info_title_${dt}`][i]
              }", info_desc = '${
                data[`info_desc_${dt}`][i] != "" && data[`info_desc_${dt}`][i]
                  ? data[`info_desc_${dt}`][i].split("'").join("\\'")
                  : ""
              }', modified_by= '${user}', modified_dt = '${datetime}'`,
              values = null,
              whr = chk_whr,
              flag = 1;
            res_dt = await db_Insert(table_name, fields, values, whr, flag);
            j++;
          }
        }
      } else {
        if (data[`info_title_${dt}`] != "") {
          var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${
            data.sec_id
          }' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND code = '${
            data[`code_${dt}`]
          }'`;
          // var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);
          // console.log(chk_dt);
          var table_name = `td_sus_dis_top_met`,
            fields = `info_title = "${
              data[`info_title_${dt}`]
            }", info_desc = '${
              data[`info_desc_${dt}`] != "" && data[`info_desc_${dt}`]
                ? data[`info_desc_${dt}`].split("'").join("\\'")
                : ""
            }', modified_by= '${user}', modified_dt = '${datetime}'`,
            values = null,
            whr = chk_whr,
            flag = 1;
          res_dt = await db_Insert(table_name, fields, values, whr, flag);
        }
      }
    }
  } else {
    var dt = data.top_id;
    var j = 1;
    if (Array.isArray(data[`metric_${dt}`])) {
      for (let i = 0; i < data[`metric_${dt}`].length; i++) {
        if (data[`info_title_${dt}`][i] != "") {
          var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${
            data.sec_id
          }' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND code = '${
            data[`code_${dt}`][i]
          }'`;
          // var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);

          var table_name = `td_sus_dis_top_met`,
            fields = `info_title = "${
              data[`info_title_${dt}`][i]
            }", info_desc = '${
              data[`info_desc_${dt}`][i] && data[`info_desc_${dt}`][i] != ""
                ? data[`info_desc_${dt}`][i].split("'").join("\\'")
                : ""
            }', modified_by= '${user}', modified_dt = '${datetime}'`,
            values = null,
            whr = chk_whr,
            flag = 1;
          res_dt = await db_Insert(table_name, fields, values, whr, flag);
          j++;
        }
      }
    } else {
      if (data[`info_title_${dt}`] != "") {
        var chk_whr = `repo_flag = '${data.flag}' AND sec_id = '${
          data.sec_id
        }' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND code = '${
          data[`code_${dt}`]
        }'`;
        // var chk_dt = await db_Select("id", "td_sus_dis_top_met", chk_whr, null);
        // console.log(chk_dt);
        var table_name = `td_sus_dis_top_met`,
          fields = `info_title = "${data[`info_title_${dt}`]}", info_desc = '${
            data[`info_desc_${dt}`] != "" && data[`info_desc_${dt}`]
              ? data[`info_desc_${dt}`].split("'").join("\\'")
              : ""
          }', modified_by= '${user}', modified_dt = '${datetime}'`,
          values = null,
          whr = chk_whr,
          flag = 1;
        res_dt = await db_Insert(table_name, fields, values, whr, flag);
      }
    }
  }
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect(
    `/sus_disc_info?sec_id=${data.sec_id}&ind_id=${
      data.ind_id
    }&flag=${encodeURIComponent(new Buffer.from(data.flag).toString("base64"))}`
  );
});

let sus_dis_chunks = {};
DataCollectionRouter.post("/save_sus_disc_info_single", async (req, res) => {
  const { chunk, chunkIndex, totalChunks, sec_id, ind_id, code, info_title, top_id, flag } = req.body;

  if (!sus_dis_chunks[chunkIndex]) {
    sus_dis_chunks[chunkIndex] = chunk;
  }

  if (Object.keys(sus_dis_chunks).length === totalChunks) {
    const fullData = Object.keys(sus_dis_chunks)
      .sort((a, b) => a - b)
      .map((key) => sus_dis_chunks[key])
      .join("");

    // Save `fullData` to MySQL database
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
      user = req.session.user.user_name;

    var chk_whr = `repo_flag = '${flag}' AND sec_id = '${sec_id}' AND ind_id = '${ind_id}' AND top_id = ${top_id} AND code = '${code}'`;
    var table_name = `td_sus_dis_top_met`,
      fields = `info_title = "${info_title}", info_desc = '${
        fullData != "" && fullData ? fullData.split("'").join("\\'") : ""
      }', modified_by= '${user}', modified_dt = '${datetime}'`,
      values = null,
      whr = chk_whr,
      flagIn = 1;
    // res_dt = await db_Insert(table_name, fields, values, whr, flagIn);

    var res_dt = await db_Insert(table_name, fields, values, whr, flagIn);
    sus_dis_chunks = {};

    res.send(res_dt);
  } else {
    res.send({ suc: 2, status: "chunk received" });
  }
});

DataCollectionRouter.get("/sus_disc_word_info", async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();

  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
    bus_id: req.query.bus_id ? req.query.bus_id : 0,
    code: req.query.code ? req.query.code : 0,
  };
  var sec_data = await getSectorList(0, flag),
    ind_list = { msg: [] },
    code_list = { msg: [] };
  if (selected.sec_id > 0) {
    ind_list = await getIndustriesList(null, selected.sec_id, flag);
    code_list = await getSusDisTopCodeList(
      0,
      selected.sec_id,
      selected.ind_id,
      0,
      flag
    );
  }
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    code_list,
    header: "Sustainability Disclosure Topics & Metrics Word Information",
    flag,
    enc_dt,
  };
  res.render("data_collection/sus_disc/word_info", data);
});

DataCollectionRouter.get("/get_sus_dis_top_code_ajax", async (req, res) => {
  var data = req.query;
  var code_list = await getSusDisTopCodeList(
    0,
    data.sec_id,
    data.ind_id,
    0,
    data.flag
  );
  res.send(code_list);
});

DataCollectionRouter.get("/get_sus_disc_word_info_ajax", async (req, res) => {
  var data = req.query;
  var res_dt = await getWordInfo(
    0,
    data.top_id,
    data.bus_id,
    data.word ? data.word : "",
    data.bus_id ? data.bus_id : 0
  );
  res.send(res_dt);
});

DataCollectionRouter.get("/copy_word_info_ajax", async (req, res) => {
  var data = req.query;
  var res_dt = await getCopyLatestWordInfoSet(data.top_id);
  res.send(res_dt);
});

DataCollectionRouter.post("/save_word_info", async (req, res) => {
  var data = req.body;
  var user = req.session.user.user_name;
  // console.log(data);
  var res_dt = await saveWordInfo(data, user);
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect(
    `/sus_disc_word_info?flag=${encodeURIComponent(
      new Buffer.from(data.flag).toString("base64")
    )}`
  );
});

DataCollectionRouter.get("/risk_opr", async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();

  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
    risk_info: "",
  };
  var sec_data = await getSectorList(0, flag),
    ind_list = { msg: [] };
  if (selected.sec_id > 0) {
    ind_list = await getIndustriesList(null, selected.sec_id, flag);
    var risk_dt = await getRiskOprnDtls(flag, selected.sec_id, selected.ind_id);
    selected["risk_info"] =
      risk_dt.suc > 0 && risk_dt.msg[0] ? risk_dt.msg[0].risk_info : "";
  }
  // console.log(ind_list);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Risk and Opportunities",
    flag,
  };
  res.render("data_collection/risk_opr/entry", data);
});

DataCollectionRouter.post("/risk_opr_info_ajax", async (req, res) => {
  var data = req.body;
  var res_dt = await getRiskOprnDtls(data.flag, data.sec_id, data.ind_id);
  res.send(res_dt);
});

// DataCollectionRouter.post('/risk_opr', async (req, res) => {
//   var data = req.body,
//     datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
//     user = req.session.user.user_name;
//   var select = "id",
//     table_name = "md_risk_opr",
//     whr = `flag = '${data.flag}' AND sec_id = ${data.sec_id} AND ind_id = ${data.ind_id}`,
//     order = null;
//   var chk_dt = await db_Select(select, table_name, whr, order);

//   var table_name = "md_risk_opr",
//     fields =
//       chk_dt.suc > 0 && chk_dt.msg.length > 0
//         ? `risk_info = '${data.risk_info}', modified_by = '${user}', modified_dt = '${datetime}'`
//         : "(flag, sec_id, ind_id, risk_info, created_by, created_dt)",
//     values = `('${data.flag}', '${data.sec_id}', '${data.ind_id}', '${data.risk_info}', '${user}', '${datetime}')`,
//     whr =
//       chk_dt.suc > 0 && chk_dt.msg.length > 0
//         ? `flag = '${data.flag}' AND sec_id = ${data.sec_id} AND ind_id = ${data.ind_id}`
//         : null,
//     flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;

//   var res_dt = await db_Insert(table_name, fields, values, whr, flag)
//   req.session.message = {
//     type: res_dt.suc > 0 ? "success" : "danger",
//     message: res_dt.msg,
//   };
//   res.redirect(
//     `/risk_opr?sec_id=${data.sec_id}&ind_id=${
//       data.ind_id
//     }&flag=${encodeURIComponent(new Buffer.from(data.flag).toString("base64"))}`
//   );
// })

let chunks = {};

DataCollectionRouter.post("/risk_opr", async (req, res) => {
  const { chunk, chunkIndex, totalChunks, sec_id, ind_id, flag } = req.body;

  if (!chunks[chunkIndex]) {
    chunks[chunkIndex] = chunk;
  }

  if (Object.keys(chunks).length === totalChunks) {
    const fullData = Object.keys(chunks)
      .sort((a, b) => a - b)
      .map((key) => chunks[key])
      .join("");

    // Save `fullData` to MySQL database
      var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
        user = req.session.user.user_name;
      var select = "id",
        table_name = "md_risk_opr",
        whr = `flag = '${flag}' AND sec_id = ${sec_id} AND ind_id = ${ind_id}`,
        order = null;
      var chk_dt = await db_Select(select, table_name, whr, order);

      var table_name = "md_risk_opr",
        fields =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `risk_info = '${fullData ? fullData.split("'").join("\\'") : ""}', modified_by = '${user}', modified_dt = '${datetime}'`
            : "(flag, sec_id, ind_id, risk_info, created_by, created_dt)",
        values = `('${flag}', '${sec_id}', '${ind_id}', '${fullData ? fullData.split("'").join("\\'") : ""}', '${user}', '${datetime}')`,
        whr =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `flag = '${flag}' AND sec_id = ${sec_id} AND ind_id = ${ind_id}`
            : null,
        flagIn = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;

      var res_dt = await db_Insert(table_name, fields, values, whr, flagIn);
      // req.session.message = {
      //   type: res_dt.suc > 0 ? "success" : "danger",
      //   message: res_dt.msg,
      // };
      // res.redirect(
      //   `/risk_opr?sec_id=${sec_id}&ind_id=${
      //     ind_id
      //   }&flag=${encodeURIComponent(new Buffer.from(flag).toString("base64"))}`
      // );
    // Clear chunks after saving
    chunks = {};

    res.send(res_dt);
  } else {
    res.send({ suc: 2, status: "chunk received" });
  }
});

DataCollectionRouter.get('/data_point', async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();
  var res_dt = await getDataPoint(flag)
  var view_data = {
    header: 'Data Point',
    data: res_dt.suc > 0 ? res_dt.msg : [],
    flag,
    enc_dt
  }
  res.render('data_collection/data_point/view', view_data)
})

// DataCollectionRouter.get('/data_point_entry', async (req, res) => {
//   var enc_dt = req.query.flag,
//     flag = new Buffer.from(enc_dt, "base64").toString();
//   var data = req.query;
//   var sec_data = await getSectorList(0, flag),
//     ind_list = await getDataPointList(flag, data.sec_id > 0 ? data.sec_id : 0);
  
//   var viewData = {
//     header: "Data Point Entry",
//     frame_list: PROJECT_LIST,
//     sec_dt: sec_data.suc > 0 ? sec_data.msg : [],
//     ind_dt: ind_list.suc > 0 ? ind_list : {},
//     sec_id: data.sec_id > 0 ? data.sec_id : 0,
//     flag: flag,
//   };
//   res.render("data_collection/data_point/edit", viewData);
// })

DataCollectionRouter.get('/data_point_entry', async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();
  var data = req.query;
  var sec_data = await getSectorList(0, flag),
    ind_list = await getDataPointList(flag, data.sec_id > 0 ? data.sec_id : 0),
    indst_list = {suc: 0};

  if (data.sec_id > 0)
    indst_list = await getIndustriesList(null, data.sec_id, flag);
  
  var viewData = {
    header: "Data Point Entry",
    frame_list: PROJECT_LIST,
    sec_dt: sec_data.suc > 0 ? sec_data.msg : [],
    ind_dt: ind_list.suc > 0 ? ind_list : {},
    ind_list: indst_list.suc > 0 ? indst_list.msg : [],
    sec_id: data.sec_id > 0 ? data.sec_id : 0,
    ind_id: data.ind_id > 0 ? data.ind_id : 0,
    flag: flag,
  };
  res.render("data_collection/data_point/edit", viewData);
})

DataCollectionRouter.post('/data_point_entry', async (req, res) => {  
  var data = req.body, file = req.files ? req.files.flag_img : null,
  user = req.session.user.user_name,
  datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'), res_dt = {}, img_dt = {};

  console.log(data);
  

  if(file){
    var img_path = file.name;
    var dir = 'assets',
    sub_dir = `${dir}/uploads/flag_icon`;
    if(!fs.existsSync(sub_dir)){
      fs.mkdirSync(sub_dir)
    }
    try{
      file.mv(`assets/uploads/flag_icon/${img_path}`, async (err) => {
        if(err) console.log(err);
        else{
          var img_chk_dt = await db_Select('id', 'md_data_point', `repo_flag = '${data.flag}'`, null)
          var img_fld = img_chk_dt.suc > 0 && img_chk_dt.msg.length > 0 ? `img_path = '${img_path}', modified_by = '${user}', modified_dt = '${datetime}'` : '(repo_flag, img_path, created_by, created_dt)',
          img_vals = `('${data.flag}', '${img_path}', '${user}', '${datetime}')`,
          img_whr = img_chk_dt.suc > 0 && img_chk_dt.msg.length > 0 ? `id = ${img_chk_dt.msg[0].id}` : null,
          img_flag = img_chk_dt.suc > 0 && img_chk_dt.msg.length > 0 ? 1 : 0;
          img_dt = await db_Insert('md_data_point', img_fld, img_vals, img_whr, img_flag)
        }
      })
    }catch(err){
      console.log(err);      
    }
  }

  if(data.sus_dis_top_met_id && data.sus_dis_top_met_id.length > 0){
    for(let dt of data.sus_dis_top_met_id){
      if(Array.isArray(data[`point_codes_${dt}`])){
        var i = 0
        for(let pdt of data[`point_codes_${dt}`]){
          if(pdt!='' && pdt){
            var chk_pt_dt = await db_Select('id', 'md_data_point_dt', `repo_flag = '${data.flag}' AND repo_flag_id = '${data[`frame_id_${dt}`][i]}' AND sec_id = ${data.sec_id} AND ind_id = ${data.ind_id} AND sus_dis_top_met_id = ${dt}`, null)
            var table_name = 'md_data_point_dt',
            fields = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? `repo_flag_id = '${data[`frame_id_${dt}`][i]}', point_codes = '${pdt}', modified_by = '${user}', modified_dt = '${datetime}'` : '(repo_flag, sec_id, ind_id, sus_dis_top_met_id, repo_flag_id, point_codes, created_by, created_dt)',
            values = `('${data.flag}', '${data.sec_id}', ${data.ind_id}, ${dt}, '${data[`frame_id_${dt}`][i]}', '${pdt}', '${user}', '${datetime}')`,
            whr = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? `id = ${chk_pt_dt.msg[0].id}` : null,
            flag = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? 1 : 0;
            res_dt = await db_Insert(table_name, fields, values, whr, flag)
            i++
          }
        }
      }else{
        if(data[`point_codes_${dt}`]!='' && data[`point_codes_${dt}`]){
          var chk_pt_dt = await db_Select('id', 'md_data_point_dt', `repo_flag = '${data.flag}' AND repo_flag_id = '${data[`frame_id_${dt}`]}' AND sec_id = ${data.sec_id} AND ind_id = ${data.ind_id} AND sus_dis_top_met_id = ${dt}`, null)
          var table_name = 'md_data_point_dt',
          fields = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? `repo_flag_id = '${data[`frame_id_${dt}`]}', point_codes = '${data[`point_codes_${dt}`]}', modified_by = '${user}', modified_dt = '${datetime}'` : '(repo_flag, sec_id, ind_id, sus_dis_top_met_id, repo_flag_id, point_codes, created_by, created_dt)',
          values = `('${data.flag}', '${data.sec_id}', ${data.ind_id}, ${dt}, '${data[`frame_id_${dt}`]}', '${data[`point_codes_${dt}`]}', '${user}', '${datetime}')`,
          whr = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? `id = ${chk_pt_dt.msg[0].id}` : null,
          flag = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? 1 : 0;
          res_dt = await db_Insert(table_name, fields, values, whr, flag)
        }
      }
    }
  }

  // if(data.ind_id.length > 0){
  //   for(let dt of data.ind_id){
  //     try{
  //       if(data[`point_codes_${dt}`] != ''){
  //         var chk_pt_dt = await db_Select('id', 'md_data_point_dt', `repo_flag = '${data.flag}' AND sec_id = ${data.sec_id} AND ind_id = ${dt}`, null)
  //         var table_name = 'md_data_point_dt',
  //         fields = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? `point_codes = '${data[`point_codes_${dt}`]}', modified_by = '${user}', modified_dt = '${datetime}'` : '(repo_flag, sec_id, ind_id, point_codes, created_by, created_dt)',
  //         values = `('${data.flag}', '${data.sec_id}', ${dt}, '${data[`point_codes_${dt}`]}', '${user}', '${datetime}')`,
  //         whr = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? `id = ${chk_pt_dt.msg[0].id}` : null,
  //         flag = chk_pt_dt.suc > 0 && chk_pt_dt.msg.length > 0 ? 1 : 0;
  //         res_dt = await db_Insert(table_name, fields, values, whr, flag)
  //       }
  //     }catch(err){
  //       res_dt = {suc: 0, msg: err}
  //     }
  //   }
  // }
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : (file ? "success" : "danger"),
    message: res_dt.suc > 0 ? res_dt.msg : file ? 'Image Uploaded' : 'No Data Found',
  };
  res.redirect(
    `/data_point?flag=${encodeURIComponent(
      new Buffer.from(data.flag).toString("base64")
    )}`
  );
})

DataCollectionRouter.post("/get_data_topic_list_ajax", async (req, res) => {
  var data = req.body
  var res_dt = await getDataPointList(data.flag, data.sec_id, data.ind_id);
  res.send(res_dt)
});

DataCollectionRouter.post('/delete_data_topic_list_ajax', async (req, res) => {
  var data = req.body;
  var table_name = 'md_data_point_dt',
  whr = `id = ${data.id}`;
  var res_dt = await db_Delete(table_name, whr)
  res.send(res_dt)
})

DataCollectionRouter.get('/set_sus_dis_info_point', async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();
  var view_data = {
    flag
  }
  res.render('data_collection/data_point_info/view', view_data)
})

DataCollectionRouter.get('/set_sus_dis_info_point_entry', async (req, res) => {
  var enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, "base64").toString();
  var data = req.query;
  var sec_data = await getSectorList(0, flag),
    indst_list = {suc: 0};

  if (data.sec_id > 0)
    indst_list = await getIndustriesList(null, data.sec_id, flag);
  var view_data = {
    header: "Data Point Entry",
    sec_dt: sec_data.suc > 0 ? sec_data.msg : [],
    ind_list: indst_list.suc > 0 ? indst_list.msg : [],
    sec_id: data.sec_id > 0 ? data.sec_id : 0,
    ind_id: data.ind_id > 0 ? data.ind_id : 0,
    flag: flag,
  }
  res.render('data_collection/data_point_info/entry', view_data)
})

let sus_dis_point_chunks = {};
DataCollectionRouter.post("/set_sus_dis_info_point_entry", async (req, res) => {
  const { chunk, chunkIndex, totalChunks, sec_id, ind_id, code_id, sl_no, info_title, flag } = req.body;

  if (!sus_dis_point_chunks[chunkIndex]) {
    sus_dis_point_chunks[chunkIndex] = chunk;
  }

  if (Object.keys(sus_dis_point_chunks).length === totalChunks) {
    const fullData = Object.keys(sus_dis_point_chunks)
      .sort((a, b) => a - b)
      .map((key) => sus_dis_point_chunks[key])
      .join("");

    // Save `fullData` to MySQL database
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
      user = req.session.user.user_name;

    var chk_whr = `repo_flag = '${flag}' AND sec_id = '${sec_id}' AND ind_id = '${ind_id}' AND code_id = '${code_id}' AND tab_title = "${info_title}"`;
    var chk_dt = await db_Select('id', 'td_sus_dist_point_info', chk_whr, null)

    var table_name = `td_sus_dist_point_info`,
      fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `sl_no="${sl_no}", tab_title = "${info_title}", tab_info = '${fullData != "" && fullData ? fullData.split("'").join("\\'") : ""}', modified_by= '${user}', modified_dt = '${datetime}'` : '(repo_flag, sec_id, ind_id, code_id, sl_no, tab_title, tab_info, created_by, created_dt)',
      values = `('${flag}', ${sec_id}, ${ind_id}, ${code_id}, '${sl_no}', '${info_title}', '${fullData != "" && fullData ? fullData.split("'").join("\\'") : ""}', '${user}', '${datetime}')`,
      whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id=${chk_dt.msg[0].id}` : null,
      flagIn = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
    // res_dt = await db_Insert(table_name, fields, values, whr, flagIn);

    var res_dt = await db_Insert(table_name, fields, values, whr, flagIn);
    sus_dis_point_chunks = {};

    res.send(res_dt);
  } else {
    res.send({ suc: 2, status: "chunk received" });
  }
});

DataCollectionRouter.get('/get_sus_dis_point_dt_ajax_stream', async (req, res) => {
  const db = require('../db/db'), data = req.query;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");
  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).send("Error connecting to the database");
    }

    const query = `SELECT a.id, a.sec_id, a.ind_id, a.repo_flag, a.code, b.tab_title, b.tab_info FROM td_sus_dis_top_met a JOIN md_industries_topics c ON a.top_id=c.id
LEFT JOIN td_sus_dist_point_info b ON a.id=b.code_id AND a.repo_flag=b.repo_flag AND a.sec_id=b.sec_id AND a.ind_id=b.ind_id
WHERE a.repo_flag = '${data.flag}' AND a.sec_id = ${data.sec_id} AND a.ind_id = ${data.ind_id} HAVING a.code !=''`;
    // console.log(query, "--------------------");

    const queryStream = connection.query(query).stream();

    queryStream.on("data", (row) => {
      // console.log(row, '+++++++++++++++++++++');
      const sanitizedRow = {};
      // for (let key in row) {
      //   if (typeof row[key] === 'string') {
      //     sanitizedRow[key] = row[key].replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      //   } else {
      //     sanitizedRow[key] = row[key];
      //   }
      // }
      res.write(JSON.stringify(row) + '\n');
      // res.write(JSON.stringify(row)); // Send each row as a JSON string
    });

    queryStream.on("end", () => {
      res.end(); // End the response once all data is sent
      connection.release(); // Release the connection back to the pool
    });

    queryStream.on("error", (error) => {
      res.status(500).send(error.message);
      connection.release(); // Ensure connection is released on error
    });
  });
  

  // const queryStream = db.query(query).stream();

  // queryStream.on("data", (row) => {
  //   console.log(row, '++++');
    
  //   res.write(JSON.stringify(row));
  // });

  // queryStream.on("end", () => {
  //   res.end(); // End the stream once all rows are sent
  // });

  // queryStream.on("error", (error) => {
  //   res.send(error.message);
  // });
})

DataCollectionRouter.get('/get_sus_dis_point_dt_ajax', async (req, res) => {
  var data = req.query;
  var select = `a.id, a.sec_id, a.ind_id, a.repo_flag, a.code, b.sl_no, b.tab_title, b.tab_info, d.topic_name`,
  table_name = `td_sus_dis_top_met a JOIN md_industries_topics c ON a.top_id=c.id AND a.repo_flag=c.repo_flag AND a.ind_id=c.ind_id JOIN md_topic d ON c.topic_id=d.id AND c.repo_flag=d.repo_flag LEFT JOIN td_sus_dist_point_info b ON a.id=b.code_id AND a.repo_flag=b.repo_flag AND a.sec_id=b.sec_id AND a.ind_id=b.ind_id`,
  whr = `a.repo_flag = '${data.flag}' AND a.sec_id = ${data.sec_id} AND a.ind_id = ${data.ind_id}`,
  order = `HAVING a.code !=''`;
  var res_dt = await db_Select(select, table_name, whr, order)
  res.send(res_dt)
})

module.exports = { DataCollectionRouter };
