const { getCalEmiType, getCalAct, getUnitList } = require('../modules/CalculatorModule');
const { get_form_builder_list, get_form_logic_list } = require('../modules/FormBuilderModule');

const FBRouter = require('express').Router(),
{db_Insert, INPUT_TYPE_LIST, SCOPE_LIST, db_Select, db_Delete} = require('../modules/MasterModule'),
dateFormat = require("dateformat");

FBRouter.get('/cal_sec_type', async (req, res) => {
    var req_dt = req.query
    var flag = req_dt.flag ? Buffer.from(req_dt.flag, 'base64').toString() : 'E'
    var data = await db_Select('*', 'md_cal_sec_type', `lang_flag = '${flag}'`, null)
    var view_data = {
        data: data.suc > 0 ? data.msg.length > 0 ? data.msg : []: [],
        header: 'Calculator Sector Type',
        flag,
        enc_flag: encodeURIComponent(Buffer.from(flag).toString('base64'))
    }
    res.render('calculator/section_type/view', view_data)
})

FBRouter.get('/cal_sec_type_edit', async (req, res) => {
    var dt = req.query
    var flag = dt.flag ? Buffer.from(dt.flag, 'base64').toString() : 'E'
    var id = dt.id,
    type_list = [];
    // console.log(dt);
    var data = {suc:0,msg:[]}
    if(id > 0){
        data = await db_Select('*', 'md_cal_sec_type', `id=${id}`, null)
        type_list = await getCalTypeList(0, data.suc > 0 ? data.msg[0].scope_id : 0)
    }else{
        type_list = await getCalTypeList(0, 0)
    }
    var view_data = {
        data: data.suc > 0 ? data.msg : [],
        type_list: type_list.suc > 0 ? type_list.msg : [],
        header: "Calculator Type",
        sub_header: "Add/Edit Calculator Sector Type",
        header_url: `/cal_sec_type`,
        id: id,
        flag
    }
    res.render('calculator/section_type/entry', view_data)
})

FBRouter.post('/cal_sec_type_edit', async (req, res) => {
    var data = req.body,
    user = req.session.user.user_name,
    datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
    console.log(data);
    
    var res_dt = await db_Insert('md_cal_sec_type', data.id > 0 ? `scope_id = ${data.scope_id}, sec_name = '${data.sec_name}', modified_by = '${user}', modified_dt = '${datetime}'` : '(lang_flag, scope_id, sec_name, created_by, created_dt)', `('${data.flag}', ${data.scope_id}, '${data.sec_name}', '${user}', '${datetime}')`, data.id > 0 ? `id=${data.id}` : null, data.id > 0 ? 1 : 0)
    if(res_dt.suc > 0){
        req.session.message = {
            type: "success",
            message: "Saved successfully",
        };
        res.redirect(data.flag != 'F' ? `/cal_sec_type` : `/cal_sec_type?flag=${encodeURIComponent(Buffer.from(data.flag).toString('base64'))}`);
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(data.flag != 'F' ? `/cal_sec_type` : `/cal_sec_type?flag=${encodeURIComponent(Buffer.from(data.flag).toString('base64'))}`);
    }
})

FBRouter.get('/cal_sec_type_del', async (req, res) => {
    var id = req.query.id
    if (id > 0) {
        var res_dt = await db_Delete('md_cal_sec_type', `id = ${id}`);
        req.session.message = { type: "danger", message: "Data deleted successfully" };
    }else{
        req.session.message = { type: "warning", message: "Data not deleted" };
    }
    res.redirect(`/cal_sec_type`);
})

FBRouter.post('/get_calc_type_list', async (req, res) => {
    var data = req.body
    var res_dt = await getCalTypeList(data.id > 0 ? data.id : 0, data.scope > 0 ? data.scope : 0)
    res.send(res_dt)
})

const getCalTypeList = (id = 0, scope = 0) => {
    return new Promise(async (resolve, reject) => {
        var res_dt = await db_Select('id, type_name, type, scope', 'md_cal_type', id > 0 ? `id=${id}` : `${scope > 0 ? `scope = ${scope}` : ''}`, null)
        resolve(res_dt)
    })
}

FBRouter.post('/get_calc_sec_type_list_ajax', async (req, res) => {
    var dt = req.body
    var data = await db_Select('*', 'md_cal_sec_type', `scope_id=${dt.scope} AND lang_flag = '${dt.lang_flag}'`, null)
    res.send(data)
})

FBRouter.get('/form_builder', async (req, res) => {
    var data = req.query
    var flag = data.flag ? Buffer.from(data.flag, 'base64').toString() : 'E'
    var data = await db_Select('DISTINCT a.scope_id, a.sec_id, b.sec_name', 'md_cal_form_builder a, md_cal_sec_type b', `a.sec_id=b.id AND a.lang_flag=b.lang_flag AND a.lang_flag='${flag}'`, 'ORDER BY a.scope_id asc')
    var scope_list = SCOPE_LIST
    res.render('form_builder/view', {header: "Calculator Form Builder", scope_dt: data.suc > 0 ? data.msg.length > 0 ? data.msg : [] : [], scope_list, flag, enc_flag: encodeURIComponent(Buffer.from(flag).toString('base64'))})
})

FBRouter.get('/form_builder_edit', async (req, res) => {
    var scope_dt = SCOPE_LIST, data = req.query, qr_dt = {}, q_header = '',
    flag = data.flag ? Buffer.from(data.flag, 'base64').toString() : 'E',
    sec_list = await db_Select('id, scope_id, sec_name', 'md_cal_sec_type', data.scope > 0 ? `lang_flag = '${flag}' AND scope_id = ${data.scope}` : `lang_flag = '${flag}'`, null);
    if(data.scope > 0 && data.type_id > 0){
        var resDt = await db_Select('*', 'md_cal_form_builder', `scope_id=${data.scope} AND sec_id=${data.type_id} AND lang_flag = '${flag}'`, 'ORDER BY id asc')
        if(resDt.suc > 0){
            var headerFilterDt = resDt.msg.filter(dt => dt.header_flag != 'N')
            var questFilterData = resDt.msg.filter(dt => dt.header_flag != 'Y')
            qr_dt = questFilterData
            // console.log(headerFilterDt);
            q_header = headerFilterDt[0].input_label
            for(let dt of questFilterData){
                if(dt.input_type != 'I'){
                    var opDt = await db_Select('id, builder_id, option_name', 'md_cal_form_builder_option', `builder_id=${dt.id} AND sec_id=${data.type_id}`, 'ORDER BY id asc')
                    dt['options'] = opDt.suc > 0 ? opDt.msg : []
                }
            }
        }
    }
    // console.log(qr_dt);
    
    res.render('form_builder/entry', {scope: scope_dt, qr_dt, q_header, scope_id: data.scope, sec_id: data.type_id, sec_list: sec_list.suc > 0 ? sec_list.msg : [], flag})
})

FBRouter.post('/form_builder_post', async (req, res) => {
    var data = req.body,
    user_name = req.session.user.user_name,
    datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    resDt = {};
    // res.send(data)
    
    if(data.cards.length > 0){
        var scopeDt = await db_Select('count(*) tot_row', 'md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id} AND lang_flag = '${data.lang_flag}'`, null)
        if(scopeDt.suc > 0){
            if(scopeDt.msg[0].tot_row > 0){
                // await db_Delete('md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id} AND lang_flag = '${data.lang_flag}'`)
                await db_Delete('md_cal_form_builder_option', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id}`)
            }
        }
        var head_chk_dt = await db_Select('id', 'md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id} AND lang_flag = '${data.lang_flag}' AND header_flag="Y" AND input_type IS NULL`, null)

        var table_name = 'md_cal_form_builder',
        fields = head_chk_dt.suc > 0 && head_chk_dt.msg.length > 0 ? `lang_flag = '${data.lang_flag}', scope_id = ${data.scope_id}, sec_id = ${data.sec_id}, input_label = '${data[`header`].split("'").join("\\'")}', modified_by = '${user_name}', modified_dt = '${datetime}'` : `(lang_flag, scope_id, sec_id, input_label, header_flag, created_by, created_dt)`,
        values = `('${data.lang_flag}', ${data.scope_id}, ${data.sec_id}, '${data[`header`].split("'").join("\\'")}', 'Y', '${user_name}', '${datetime}')`,
        whr= head_chk_dt.suc > 0 && head_chk_dt.msg.length > 0 ? `id=${head_chk_dt.msg[0].id}` : null,
        flag = head_chk_dt.suc > 0 && head_chk_dt.msg.length > 0 ? 1 : 0;
        resDt = await db_Insert(table_name, fields, values, whr, flag)
        for(let id of data.cards){
            var chkDt = await db_Select('id', 'md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id} AND lang_flag = '${data.lang_flag}' AND header_flag="N" AND is_parent = '${data[`p_c_${id}`] > 0 ? 'N': (data[`p_s_c_${id}`] > 0 ? 'N' : 'Y')}' AND parent_id = '${data[`p_c_${id}`] > 0 ? data[`p_c_${id}`] : 0}' AND is_sub_parent = '${data[`p_s_c_${id}`] > 0 ? 'N': 'Y'}' AND sub_parent_id = '${data[`p_s_c_${id}`] > 0 ? data[`p_s_c_${id}`] : 0}'`, null)

            var table_name = 'md_cal_form_builder',
            fields = chkDt.suc > 0 && chkDt.msg.length > 0 ? `scope_id = ${data.scope_id}, sec_id = ${data.sec_id}, input_type = '${INPUT_TYPE_LIST[data[`option_${id}`]]}', input_label = '${data[`q_${id}`].split("'").join("\\'")}', input_heading = '${data[`hed_${id}`]}', sequence = '${data[`s_${id}`]}', is_parent = '${data[`p_c_${id}`] > 0 ? 'N': (data[`p_s_c_${id}`] > 0 ? 'N' : 'Y')}', parent_id = '${data[`p_c_${id}`] > 0 ? data[`p_c_${id}`] : 0}', is_sub_parent = '${data[`p_s_c_${id}`] > 0 ? 'N': 'Y'}', sub_parent_id = '${data[`p_s_c_${id}`] > 0 ? data[`p_s_c_${id}`] : 0}', modified_by = '${user_name}', modified_dt = '${datetime}'` : `(scope_id, sec_id, input_type, input_label, input_heading, sequence, is_parent, parent_id, is_sub_parent, sub_parent_id, created_by, created_dt)`,
            values = `(${data.scope_id}, ${data.sec_id}, '${INPUT_TYPE_LIST[data[`option_${id}`]]}', '${data[`q_${id}`].split("'").join("\\'")}', '${data[`hed_${id}`]}', '${data[`s_${id}`]}', '${data[`p_c_${id}`] > 0 ? 'N': (data[`p_s_c_${id}`] > 0 ? 'N' : 'Y')}', '${data[`p_c_${id}`] > 0 ? data[`p_c_${id}`] : 0}', '${data[`p_s_c_${id}`] > 0 ? 'N': 'Y'}', '${data[`p_s_c_${id}`] > 0 ? data[`p_s_c_${id}`] : 0}', '${user_name}', '${datetime}')`,
            whr= chkDt.suc > 0 && chkDt.msg.length > 0 ? `id=${chkDt.msg[0].id}` : null,
            flag = chkDt.suc > 0 && chkDt.msg.length > 0 ? 1 : 0;
            resDt = await db_Insert(table_name, fields, values, whr, flag)

            var builder_id = chkDt.suc > 0 && chkDt.msg.length > 0 ? chkDt.msg[0].id : (resDt.suc > 0 ? resDt.lastId.insertId : 0)

            if(['radio', 'check', 'drop'].includes(data[`option_${id}`]) && builder_id > 0){
                for(let opt of data[`q_s_${id}`]){
                    var table_name = 'md_cal_form_builder_option',
                    fields = `(scope_id, sec_id, builder_id, option_name, created_by, created_dt)`,
                    values = `(${data.scope_id}, ${data.sec_id}, ${builder_id}, '${opt}', '${user_name}', '${datetime}')`,
                    whr= null,
                    flag = 0;
                    await db_Insert(table_name, fields, values, whr, flag)
                }
            }
        }
    }
    res.redirect(`/build_logic?scope=${data.scope_id}&type_id=${data.sec_id}`)
})

FBRouter.get('/build_logic', async (req, res) => {
    var data = req.query
    var q_data = await get_form_builder_list(data.scope, data.type_id)
    var q_logic_data = await get_form_logic_list(data.scope, data.type_id)
    var cal_type = await getCalTypeList(0),
    cal_act = await getCalAct(0, 0),
    cal_emi_type = await getCalEmiType(0, 0, 0),
    cal_unit = await getUnitList(0);
    res.render('form_builder/logic_build', {q_data: q_data.suc > 0 ? q_data.msg : false, cal_type: cal_type.suc > 0 ? cal_type.msg : [], cal_act: cal_act.suc > 0 ? cal_act.msg : [], cal_emi_type: cal_emi_type.suc > 0 ? cal_emi_type.msg : [], cal_unit: cal_unit.suc > 0 ? cal_unit.msg : [], logic_dt: q_logic_data.suc > 0 ? q_logic_data.msg : [], scope_id: data.scope, type_id: data.type_id})
})

FBRouter.post('/build_logic', async (req, res) => {
    var data = req.body, res_dt, user = req.session.user.user_name, datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
    
    if(data.quest_list.length > 0){
        for(let dt of data.quest_list){
            var chkDt = await db_Select('id', 'md_cal_form_build_logic', `quest_id=${dt} AND option_val='${data[`option_${dt}`]}'`, null)

            var table_name = 'md_cal_form_build_logic',
            fields = chkDt.suc > 0 && chkDt.msg.length > 0 ? `option_val = '${data[`option_${dt}`]}', action_val = '${data[`option_action_${dt}`]}', next_qst_action_val = '${data[`next_quest_act_${dt}`]}', emi_head_opt1 = ${data[`em_hed_${dt}`] ? `"${data[`em_hed_${dt}`][0]}"` : 'NULL'}, emi_head_opt2 = ${data[`em_hed_${dt}`] ? `"${data[`em_hed_${dt}`][1]}"` : 'NULL'}, emi_head_opt3 = ${data[`em_hed_${dt}`] ? `"${data[`em_hed_${dt}`][2]}"` : 'NULL'}, modified_by = '${user}', modified_dt = '${datetime}'` : `(quest_id, option_val, action_val, next_qst_action_val, emi_head_opt1, emi_head_opt2, emi_head_opt3, created_by, created_dt)`,
            values = `(${dt}, '${data[`option_${dt}`]}', '${data[`option_action_${dt}`]}', '${data[`next_quest_act_${dt}`]}', ${data[`em_hed_${dt}`] ? `"${data[`em_hed_${dt}`][0]}"` : 'NULL'}, ${data[`em_hed_${dt}`] ? `"${data[`em_hed_${dt}`][1]}"` : 'NULL'}, ${data[`em_hed_${dt}`] ? `"${data[`em_hed_${dt}`][2]}"` : 'NULL'}, '${user}', '${datetime}')`,
            whr = chkDt.suc > 0 && chkDt.msg.length > 0 ? `quest_id=${dt} AND option_val='${data[`option_${dt}`]}'` : null,
            flag = chkDt.suc > 0 && chkDt.msg.length > 0 ? 1 : 0;
            res_dt = await db_Insert(table_name, fields, values, whr, flag)
        }
    }
    res.redirect('/form_builder')
})

module.exports = {FBRouter}