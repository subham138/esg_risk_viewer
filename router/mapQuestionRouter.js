const { get_form_logic_list } = require("../modules/MapQuestionModule");
const { SCOPE_LIST,db_Select } = require("../modules/MasterModule");

const express = require("express"),
mapQuestionRouter = express.Router(),
dateFormat = require("dateformat");

mapQuestionRouter.get("/map_ques", async (req, res) => {
  var data = req.query
    var flag = data.flag ? Buffer.from(data.flag, 'base64').toString() : 'E'
    var data = await db_Select('DISTINCT a.scope_id, a.sec_id, b.sec_name', 'md_cal_form_builder a, md_cal_sec_type b', `a.sec_id=b.id AND a.lang_flag=b.lang_flag AND a.lang_flag='${flag}'`, 'ORDER BY a.scope_id asc')
    var scope_list = SCOPE_LIST
    res.render('map_ques/view', {header: "Map Questions", scope_dt: data.suc > 0 ? data.msg.length > 0 ? data.msg : [] : [], scope_list, flag, enc_flag: encodeURIComponent(Buffer.from(flag).toString('base64'))})
});

mapQuestionRouter.post('/get_calc_sec_type_list_ajax', async (req, res) => {
    var dt = req.body
    var data = await db_Select('*', 'md_cal_sec_type', `scope_id=${dt.scope} AND lang_flag = '${dt.lang_flag}'`, null)
    res.send(data)
})

mapQuestionRouter.get('/map_ques_edit', async (req, res) => {
   var scope_dt = SCOPE_LIST, data = req.query, qr_dt = {}, q_header = '',
   flag = data.flag ? Buffer.from(data.flag, 'base64').toString() : 'E',
   sec_list = await db_Select('id, scope_id, sec_name', 'md_cal_sec_type', data.scope > 0 ? `lang_flag = '${flag}' 
   AND scope_id = ${data.scope}` : `lang_flag = '${flag}'`, null);
   if(data.scope > 0 && data.type_id > 0){
   var resDt = await db_Select('*', 'md_cal_form_builder', `scope_id=${data.scope} AND sec_id=${data.type_id} AND lang_flag = '${flag}' AND is_parent = 'Y'`, 'ORDER BY scope_id asc')
      if(resDt.suc > 0){
            var headerFilterDt = resDt.msg.filter(dt => dt.header_flag != 'N')
            var questFilterData = resDt.msg.filter(dt => dt.header_flag != 'Y')
            qr_dt = questFilterData
            console.log(qr_dt);
            q_header = headerFilterDt[0].input_label
        }        
   }
    res.render('map_ques/entry', {scope: scope_dt, qr_dt, q_header, scope_id: data.scope, sec_id: data.type_id, sec_list: sec_list.suc > 0 ? sec_list.msg : [], flag})
})

module.exports = {mapQuestionRouter}