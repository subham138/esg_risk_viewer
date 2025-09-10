const { get_form_logic_list } = require("../modules/MapQuestionModule");
const { SCOPE_LIST,db_Select, db_Insert, db_Delete } = require("../modules/MasterModule");

const express = require("express"),
mapQuestionRouter = express.Router(),
dateFormat = require("dateformat");

mapQuestionRouter.get("/map_ques", async (req, res) => {
  var data = req.query
  var flag = data.flag ? Buffer.from(data.flag, 'base64').toString() : 'E'
  var data = await db_Select('DISTINCT a.id,a.lang_flag,a.p_scope_id,a.p_sec_id,a.p_f_builder_id,a.c_scope_id,a.c_sec_id,a.c_f_builder_id,b.input_label p_f_builder,c.sec_name p_sec,d.input_label c_f_builder,e.sec_name c_sec', 'md_cal_form_build_map_quest a, md_cal_form_builder b, md_cal_sec_type c, md_cal_form_builder d, md_cal_sec_type e', `a.lang_flag COLLATE utf8mb4_general_ci = b.lang_flag 
                       AND a.p_scope_id = b.scope_id
                       AND a.p_f_builder_id = b.id
                       AND a.p_sec_id = c.id
                       AND a.lang_flag COLLATE utf8mb4_general_ci = d.lang_flag
                       AND a.c_scope_id = d.scope_id
                       AND a.c_f_builder_id = d.id
                       AND a.c_sec_id = e.id`, null)
    var scope_list = SCOPE_LIST
    // console.log(data);
    res.render('map_ques/view', {header: "Map Questions", scope_dt: data.suc > 0 ? data.msg.length > 0 ? data.msg : [] : [], scope_list, flag, enc_flag: encodeURIComponent(Buffer.from(flag).toString('base64'))})    
});

mapQuestionRouter.get('/map_ques_edit', async (req, res) => {
   var scope_dt = SCOPE_LIST, data = req.query;
    flag = data.flag ? Buffer.from(data.flag, 'base64').toString() : 'E',
    sec_list = await db_Select('id, scope_id, sec_name', 'md_cal_sec_type', data.scope > 0 ? `lang_flag = '${flag}' AND scope_id = ${data.scope}` : `lang_flag = '${flag}'`, null);
    res.render('map_ques/entry', {scope: scope_dt, scope_id: data.scope, sec_id: data.type_id, sec_list: sec_list.suc > 0 ? sec_list.msg : [], flag, scopes_id: data.scope, secs_id: data.type_id,})
});

mapQuestionRouter.post('/get_calc_ques_list_ajax', async (req, res) => {
    var dt = req.body
    // console.log(dt,'data');
    var data = await db_Select('*', 'md_cal_form_builder', `scope_id='${dt.scope}' AND sec_id='${dt.sec_id}' AND lang_flag = '${dt.lang_flag}' AND is_parent = 'Y'`, null)
    res.send(data)
})

mapQuestionRouter.post('/map_ques_save', async (req, res) => {
    var data = req.body
    user_name = req.session.user.user_name,
    datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
    let resDt = {};
    // console.log(data,user_name,datetime,'console');

    if(Array.isArray(data.scopes_id)){
        let i = 0
        for(let dt of data.scopes_id){
            let c_scop_id = dt,
            c_sec_id = data.secs_id[i],
            c_f_builder_id = data.quests_list[i];
            var table_name = 'md_cal_form_build_map_quest',
            fields = `(lang_flag, p_scope_id, p_sec_id, p_f_builder_id, c_scope_id, c_sec_id, c_f_builder_id, created_by, created_dt)`,
            values = `('${data.lang_flag}', '${data.scope_id}',' ${data.sec_id}', '${data.quest_list}', '${c_scop_id}', '${c_sec_id}', ${c_f_builder_id},'${user_name}', '${datetime}')`,
            whr = null,
            flag =  0;
            resDt = await db_Insert(table_name, fields, values, whr, flag)
            i++
        }
    }else{
        let c_scop_id = data.scopes_id,
            c_sec_id = data.secs_id,
            c_f_builder_id = data.quests_list;
            var table_name = 'md_cal_form_build_map_quest',
            fields = `(lang_flag, p_scope_id, p_sec_id, p_f_builder_id, c_scope_id, c_sec_id, c_f_builder_id, created_by, created_dt)`,
            values = `('${data.lang_flag}', '${data.scope_id}',' ${data.sec_id}', '${data.quest_list}', '${c_scop_id}', '${c_sec_id}', ${c_f_builder_id},'${user_name}', '${datetime}')`,
            whr = null,
            flag =  0;
            resDt = await db_Insert(table_name, fields, values, whr, flag)
    }
res.redirect(`/map_ques?f=${data.lang_flag}`);
});

mapQuestionRouter.get('/map_ques_del', async (req, res) => {
      var id = req.query.id
    if (id > 0) {
        var res_dt = await db_Delete('md_cal_form_build_map_quest', `id = ${id}`);
        req.session.message = { type: "danger", message: "Data deleted successfully" };
    }else{
        req.session.message = { type: "warning", message: "Data not deleted" };
    } 
    res.redirect(`/map_ques?f=${data.lang_flag}`);
})

module.exports = {mapQuestionRouter}