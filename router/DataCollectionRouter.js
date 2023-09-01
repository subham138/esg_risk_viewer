const express = require("express"),
  DataCollectionRouter = express.Router();

const { getSectorList, getIndustriesList } = require("../modules/AdminModule");
const { db_Insert, db_Select } = require("../modules/MasterModule");

DataCollectionRouter.get("/sus_disc", async (req, res) => {
  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(),
    ind_list = [];
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Sustainability Disclosure Topics & Metrics",
  };
  res.render("data_collection/sus_disc", data);
});

DataCollectionRouter.post('/save_sus_disc', async (req, res) => {
  var data = req.body
  for(let dt of data.top_id){
    for(let i = 0; i < data[`metric_${dt}`].length; i++){
      var chk_whr = `top_id = ${dt} AND metric = '${data[`metric_${dt}`][i]}' AND catg = '${data[`catg_${dt}`][i]}' AND unit = '${data[`unit_${dt}`][i]}' AND code = '${data[`code_${dt}`][i]}'`;
      var chk_dt = await db_Select('id', 'td_sus_dis_top_met', chk_whr, null)
      
      var table_name = `td_sus_dis_top_met`, 
      fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `top_id = '${dt}', metric = '${data[`metric_${dt}`][i]}', catg = '${data[`catg_${dt}`][i]}', unit = '${data[`unit_${dt}`][i]}', code = '${data[`code_${dt}`][i]}'` : '', 
      values, 
      whr, 
      flag;
      var res_dt = await db_Insert(table_name, fields, values, whr, flag)
      console.log(` \n`);
    }
  }
  res.send(data)
})

module.exports = { DataCollectionRouter };
