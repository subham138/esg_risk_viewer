const express = require("express"),
  DataCollectionRouter = express.Router(),
  dateFormat = require('dateformat');

const { getSectorList, getIndustriesList } = require("../modules/AdminModule");
const { getSusDiscList, getActMetrialDtls } = require("../modules/DataCollectionModule");
const { db_Insert, db_Select } = require("../modules/MasterModule");

DataCollectionRouter.get("/sus_disc", async (req, res) => {
  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(),
    ind_list = {msg:[]};
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

DataCollectionRouter.post('/save_sus_disc', async (req, res) => {
  var data = req.body, res_dt, 
  user = 'admin', 
  datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  for(let dt of data.top_id){
    // console.log(dt);
    var j = 1;
    // console.log(Array.isArray(data[`metric_${dt}`]));
    if(Array.isArray(data[`metric_${dt}`])){
      for(let i = 0; i < data[`metric_${dt}`].length; i++){
        var chk_whr = `sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND sl_no = ${j}`;
        var chk_dt = await db_Select('id', 'td_sus_dis_top_met', chk_whr, null)
        
        var table_name = `td_sus_dis_top_met`, 
        fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `top_id = '${dt}', metric = '${data[`metric_${dt}`][i]}', catg = '${data[`catg_${dt}`][i]}', unit = '${data[`unit_${dt}`][i]}', code = '${data[`code_${dt}`][i]}', modified_by= '${user}', modified_dt = '${datetime}'` : 
          '(sec_id, ind_id, top_id, sl_no, metric, catg, unit, code, created_by, created_dt)', 
        values = `('${data.sec_id}', '${data.ind_id}', '${dt}', '${j}', '${data[`metric_${dt}`][i]}', '${data[`catg_${dt}`][i]}', '${data[`unit_${dt}`][i]}', '${data[`code_${dt}`][i]}', '${user}', '${datetime}')`,
        whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = '${chk_dt.msg[0].id}'` : null, 
        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
        res_dt = await db_Insert(table_name, fields, values, whr, flag)
        j++
      }
    }else{
      var chk_whr = `sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND top_id = ${dt} AND sl_no = ${j}`;
      var chk_dt = await db_Select('id', 'td_sus_dis_top_met', chk_whr, null)
      console.log(chk_dt);
      var table_name = `td_sus_dis_top_met`, 
      fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `top_id = '${dt}', metric = '${data[`metric_${dt}`]}', catg = '${data[`catg_${dt}`]}', unit = '${data[`unit_${dt}`]}', code = '${data[`code_${dt}`]}', modified_by= '${user}', modified_dt = '${datetime}'` : 
        '(sec_id, ind_id, top_id, sl_no, metric, catg, unit, code, created_by, created_dt)', 
      values = `('${data.sec_id}', '${data.ind_id}', '${dt}', '${j}', '${data[`metric_${dt}`]}', '${data[`catg_${dt}`]}', '${data[`unit_${dt}`]}', '${data[`code_${dt}`]}', '${user}', '${datetime}')`,
      whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = '${chk_dt.msg[0].id}'` : null, 
      flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
      res_dt = await db_Insert(table_name, fields, values, whr, flag)
    }
  }
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect(`/sus_disc?sec_id=${data.sec_id}&ind_id=${data.ind_id}`);
})

DataCollectionRouter.get("/sus_disc_ajax", async (req, res) => {
  var data = req.query
  var res_dt = await getSusDiscList(data.sec_id, data.ind_id, 0)
  res_dt = {suc: res_dt.suc > 0 ? (res_dt.msg.length > 0 ? 1 : 2) : res_dt.suc,  msg: res_dt.msg}
  res.send(res_dt)
});

DataCollectionRouter.get('/act_metric', async (req, res) => {
  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(),
    ind_list = {msg:[]};
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
})

DataCollectionRouter.post('/save_act_metric', async (req, res) => {
  var data = req.body, res_dt, 
  user = 'admin', 
  datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  let j = 1
  if(Array.isArray(data.act_metric)){
    for(let i = 0; i<data.act_metric.length; i++){
      var chk_whr = `sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND sl_no = ${j}`;
      var chk_dt = await db_Select('id', 'td_act_metrics', chk_whr, null)
      
      var table_name = `td_act_metrics`, 
      fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `act_metric = '${data.act_metric[i]}', catg = '${data.catg[i]}', unit = '${data.unit[i]}', code = '${data.code[i]}', modified_by= '${user}', modified_dt = '${datetime}'` : 
        '(sec_id, ind_id, sl_no, act_metric, catg, unit, code, created_by, created_dt)', 
      values = `('${data.sec_id}', '${data.ind_id}', '${j}', '${data.act_metric[i]}', '${data.catg[i]}', '${data.unit[i]}', '${data.code[i]}', '${user}', '${datetime}')`,
      whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = '${chk_dt.msg[0].id}'` : null, 
      flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
      res_dt = await db_Insert(table_name, fields, values, whr, flag)
      j++
    }
  }else{
    var chk_whr = `sec_id = '${data.sec_id}' AND ind_id = '${data.ind_id}' AND sl_no = ${j}`;
    var chk_dt = await db_Select('id', 'td_act_metrics', chk_whr, null)
    
    var table_name = `td_act_metrics`, 
    fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `act_metric = '${data.act_metric}', catg = '${data.catg}', unit = '${data.unit}', code = '${data.code}', modified_by= '${user}', modified_dt = '${datetime}'` : 
      '(sec_id, ind_id, sl_no, act_metric, catg, unit, code, created_by, created_dt)', 
    values = `('${data.sec_id}', '${data.ind_id}', '${j}', '${data.act_metric}', '${data.catg}', '${data.unit}', '${data.code}', '${user}', '${datetime}')`,
    whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = '${chk_dt.msg[0].id}'` : null, 
    flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
    res_dt = await db_Insert(table_name, fields, values, whr, flag)
  }

  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect(`/act_metric?sec_id=${data.sec_id}&ind_id=${data.ind_id}`);
  // res.send(res_dt)
})

DataCollectionRouter.get('/get_act_metric_ajax', async (req, res) => {
  var data = req.query
  var res_dt = await getActMetrialDtls(data.sec_id, data.ind_id)
  res_dt = {suc: res_dt.suc > 0 ? (res_dt.msg.length > 0 ? 1 : 2) : res_dt.suc, msg: res_dt.msg}
  res.send(res_dt)
})

DataCollectionRouter.get('/dynamic_entry', (req, res) => {
  res.render('data_collection/dynamic_form/entry')
})

DataCollectionRouter.post('/save_dynamic_entry', (req, res) => {
  var data = req.body
  res.send(data)
})

module.exports = { DataCollectionRouter };
