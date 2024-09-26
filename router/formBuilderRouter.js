const { getCalEmiType, getCalAct } = require('../modules/CalculatorModule');
const { get_form_builder_list } = require('../modules/FormBuilderModule');

const FBRouter = require('express').Router(),
{db_Insert, INPUT_TYPE_LIST, SCOPE_LIST, db_Select, db_Delete} = require('../modules/MasterModule'),
dateFormat = require("dateformat");

FBRouter.get('/cal_sec_type', async (req, res) => {
    var data = await db_Select('*', 'md_cal_sec_type', null, null)
    var view_data = {
        data,
        header: 'Calculator Sector Type'
    }
    res.render('calculator/section_type/view', view_data)
})

FBRouter.get('/cal_sec_type_edit', async (req, res) => {
    var dt = req.query
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
    }
    res.render('calculator/section_type/entry', view_data)
})

FBRouter.post('/cal_sec_type_edit', async (req, res) => {
    var data = req.body,
    user = req.session.user.user_name,
    datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
    console.log(data);
    
    var res_dt = await db_Insert('md_cal_sec_type', data.id > 0 ? `scope_id = ${data.scope_id}, type_id='${data.type_id}', sec_name = '${data.sec_name}', modified_by = '${user}', modified_dt = '${datetime}'` : '(scope_id, type_id, sec_name, created_by, created_dt)', `(${data.scope_id}, '${data.type_id}', '${data.sec_name}', '${user}', '${datetime}')`, data.id > 0 ? `id=${data.id}` : null, data.id > 0 ? 1 : 0)
    if(res_dt.suc > 0){
        req.session.message = {
            type: "success",
            message: "Saved successfully",
        };
        res.redirect(`/cal_sec_type`);
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(data.id > 0 ? `/cal_sec_type` : `/cal_sec_type`);
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
    var data = await db_Select('*', 'md_cal_sec_type', `scope_id=${dt.scope}`, null)
    res.send(data)
})

FBRouter.get('/form_builder', async (req, res) => {
    var data = await db_Select('DISTINCT scope_id', 'md_cal_form_builder', null, 'ORDER BY scope_id asc')
    var scope_list = SCOPE_LIST
    res.render('form_builder/view', {header: "Calculator Form Builder", scope_dt: data, scope_list})
})

FBRouter.get('/form_builder_edit', async (req, res) => {
    var scope_dt = SCOPE_LIST, data = req.query, qr_dt = {}, q_header = '',
    sec_list = await db_Select('scope_id, type_id, sec_name', 'md_cal_sec_type', data.scope > 0 ? `scope_id = ${data.scope}` : null, null);
    if(data.scope > 0){
        var resDt = await db_Select('*', 'md_cal_form_builder', `scope_id=${data.scope}`, 'ORDER BY id asc')
        if(resDt.suc > 0){
            var headerFilterDt = resDt.msg.filter(dt => dt.header_flag != 'N')
            var questFilterData = resDt.msg.filter(dt => dt.header_flag != 'Y')
            qr_dt = questFilterData
            // console.log(headerFilterDt);
            q_header = headerFilterDt[0].input_label
            for(let dt of questFilterData){
                if(dt.input_type != 'I'){
                    var opDt = await db_Select('id, builder_id, option_name', 'md_cal_form_builder_option', `builder_id=${dt.id}`, 'ORDER BY id asc')
                    dt['options'] = opDt.suc > 0 ? opDt.msg : []
                }
            }
        }
    }
    console.log(qr_dt);
    
    res.render('form_builder/entry', {scope: scope_dt, qr_dt, q_header, scope_id: data.scope, sec_id: data.sec_id, sec_list: sec_list.suc > 0 ? sec_list.msg : []})
})

FBRouter.post('/form_builder_post', async (req, res) => {
    var data = req.body,
    user_name = req.session.user.user_name,
    datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    resDt = {};
    
    if(data.cards.length > 0){
        var scopeDt = await db_Select('count(*) tot_row', 'md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id}`, null)
        if(scopeDt.suc > 0){
            if(scopeDt.msg[0].tot_row > 0){
                await db_Delete('md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id}`)
                await db_Delete('md_cal_form_builder_option', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id}`)
            }
        }
        var table_name = 'md_cal_form_builder',
        fields = `(scope_id, sec_id, input_label, header_flag, created_by, created_dt)`,
        values = `(${data.scope_id}, ${data.sec_id}, '${data[`header`].split("'").join("\\'")}', 'Y', '${user_name}', '${datetime}')`,
        whr= null,
        flag = 0;
        resDt = await db_Insert(table_name, fields, values, whr, flag)
        for(let id of data.cards){
            var table_name = 'md_cal_form_builder',
            fields = `(scope_id, sec_id, input_type, input_label, input_heading, sequence, is_parent, parent_id, is_sub_parent, sub_parent_id, created_by, created_dt)`,
            values = `(${data.scope_id}, ${data.sec_id}, '${INPUT_TYPE_LIST[data[`option_${id}`]]}', '${data[`q_${id}`].split("'").join("\\'")}', '${data[`hed_${id}`]}', '${data[`s_${id}`]}', '${data[`p_c_${id}`] > 0 ? 'N': (data[`p_s_c_${id}`] > 0 ? 'N' : 'Y')}', '${data[`p_c_${id}`] > 0 ? data[`p_c_${id}`] : 0}', '${data[`p_s_c_${id}`] > 0 ? 'N': 'Y'}', '${data[`p_s_c_${id}`] > 0 ? data[`p_s_c_${id}`] : 0}', '${user_name}', '${datetime}')`,
            whr= null,
            flag = 0;
            resDt = await db_Insert(table_name, fields, values, whr, flag)
            var builder_id = resDt.suc > 0 ? resDt.lastId.insertId : 0
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
    res.send(resDt)
})

FBRouter.get('/build_logic', async (req, res) => {
    var q_data = await get_form_builder_list(1, 1)
    var cal_type = await getCalTypeList(0),
    cal_act = await getCalAct(0, 0),
    cal_emi_type = await getCalEmiType(0, 0, 0);
    res.render('form_builder/logic_build', {q_data: q_data.suc > 0 ? q_data.msg : false, cal_type: cal_type.suc > 0 ? cal_type.msg : [], cal_act: cal_act.suc > 0 ? cal_act.msg : [], cal_emi_type: cal_emi_type.suc > 0 ? cal_emi_type.msg : []})
})

module.exports = {FBRouter}