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
    
    var res_dt = await db_Insert('md_cal_sec_type', data.id > 0 ? `scope_id = ${data.scope_id}, sec_name = '${data.sec_name.split("'").join("\\'")}', modified_by = '${user}', modified_dt = '${datetime}'` : '(lang_flag, scope_id, sec_name, created_by, created_dt)', `('${data.flag}', ${data.scope_id}, '${data.sec_name.split("'").join("\\'")}', '${user}', '${datetime}')`, data.id > 0 ? `id=${data.id}` : null, data.id > 0 ? 1 : 0)
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
        var resDt = await db_Select('*', 'md_cal_form_builder', `scope_id=${data.scope} AND sec_id=${data.type_id} AND lang_flag = '${flag}'`, 'ORDER BY sequence asc, id asc')
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
    try {
        var data = req.body,
        user_name = (req.session.user && req.session.user.user_name) ? req.session.user.user_name : 'Admin',
        datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');

        const safeStr = (val) => {
            if (val === undefined || val === null) return '';
            if (Array.isArray(val)) val = val[0] || '';
            return String(val).split("'").join("\\'");
        };

        const rawCards = data.cards !== undefined && data.cards !== null ? (Array.isArray(data.cards) ? data.cards : [data.cards]) : [];
        const cardList = [...new Set(rawCards.map(c => String(c).trim()).filter(c => c.length > 0))];

        if(cardList.length > 0 && data.scope_id > 0 && data.sec_id > 0){
            // 1. Delete previous questions and options for this scope/sec/lang to cleanly remove deleted cards
            var oldRows = await db_Select('id', 'md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id} AND lang_flag = '${data.lang_flag}'`, null);
            if(oldRows.suc > 0 && oldRows.msg.length > 0){
                var oldIds = oldRows.msg.map(dt => dt.id).join(',');
                if (oldIds.length > 0) {
                    await db_Delete('md_cal_form_builder_option', `builder_id IN (${oldIds}) OR (scope_id = ${data.scope_id} AND sec_id = ${data.sec_id})`);
                }
                await db_Delete('md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id} AND lang_flag = '${data.lang_flag}'`);
            }

            // 2. Insert Header row
            var headerText = safeStr(data.header);
            var headFields = `(lang_flag, scope_id, sec_id, input_label, header_flag, created_by, created_dt)`;
            var headValues = `('${data.lang_flag}', ${data.scope_id}, ${data.sec_id}, '${headerText}', 'Y', '${user_name}', '${datetime}')`;
            await db_Insert('md_cal_form_builder', headFields, headValues, null, 0);

            // 3. Insert each Question card in sequence
            for(let i = 0; i < cardList.length; i++){
                let id = cardList[i];
                let optionKey = data[`option_${id}`] ? (Array.isArray(data[`option_${id}`]) ? data[`option_${id}`][0] : data[`option_${id}`]) : 'short_text';
                let inputType = INPUT_TYPE_LIST[optionKey] || 'I';
                let qLabel = safeStr(data[`q_${id}`]);
                let qHeading = safeStr(data[`hed_${id}`]);
                let seq = parseInt(data[`s_${id}`]) || (i + 1);
                let pVal = parseInt(data[`p_c_${id}`]) || 0;
                let psVal = parseInt(data[`p_s_c_${id}`]) || 0;
                let isParent = (pVal > 0 || psVal > 0) ? 'N' : 'Y';
                let isSubParent = (psVal > 0) ? 'N' : 'Y';

                let fields = `(lang_flag, scope_id, sec_id, input_type, input_label, input_heading, sequence, is_parent, parent_id, is_sub_parent, sub_parent_id, header_flag, created_by, created_dt)`;
                let values = `('${data.lang_flag}', ${data.scope_id}, ${data.sec_id}, '${inputType}', '${qLabel}', '${qHeading}', '${seq}', '${isParent}', '${pVal}', '${isSubParent}', '${psVal}', 'N', '${user_name}', '${datetime}')`;
                
                let resDt = await db_Insert('md_cal_form_builder', fields, values, null, 0);
                let builder_id = (resDt.suc > 0 && resDt.lastId) ? resDt.lastId.insertId : 0;

                if(['radio', 'check', 'drop'].includes(optionKey) && builder_id > 0){
                    let rawOpts = data[`q_s_${id}`];
                    let optList = Array.isArray(rawOpts) ? rawOpts : (rawOpts !== undefined && rawOpts !== null ? [rawOpts] : []);
                    for(let opt of optList){
                        let optName = safeStr(opt).trim();
                        if (optName.length > 0) {
                            let optFields = `(scope_id, sec_id, builder_id, option_name, created_by, created_dt)`;
                            let optValues = `(${data.scope_id}, ${data.sec_id}, ${builder_id}, '${optName}', '${user_name}', '${datetime}')`;
                            await db_Insert('md_cal_form_builder_option', optFields, optValues, null, 0);
                        }
                    }
                }
            }

            req.session.message = {
                type: "success",
                message: "Template questions saved successfully!",
            };
        } else {
            req.session.message = {
                type: "warning",
                message: "No question cards found to save.",
            };
        }
    } catch (err) {
        console.error('Error saving form builder template:', err);
        req.session.message = {
            type: "danger",
            message: "Error saving template questions: " + err.message,
        };
    }
    res.redirect(`/build_logic?scope=${data.scope_id}&type_id=${data.sec_id}`);
});

FBRouter.get('/form_builder_del', async (req, res) => {
    var data = req.query
    var res_dt = await db_Select('id', 'md_cal_form_builder', `scope_id = ${data.scope} and sec_id = ${data.type_id} and lang_flag = '${data.flag}'`, null)
    if(res_dt.suc > 0 && res_dt.msg.length > 0){
        var builder_ids = res_dt.msg.map(dt => dt.id).join(',')
        var frm_builder_del = await db_Delete('md_cal_form_builder', `id IN (${builder_ids})`)
        if (frm_builder_del.suc > 0) {
            await db_Delete('md_cal_form_builder_option', `builder_id IN (${builder_ids})`)
            await db_Delete('md_cal_form_build_logic', `quest_id IN (${builder_ids})`)
            req.session.message = { type: "success", message: "Data deleted successfully" };
        }else{
            req.session.message = { type: "danger", message: "Error while deleting Form Builder" };
        }
    }else{
        req.session.message = { type: "warning", message: "No Data Found" };
    }
    var routing = '/form_builder'
    if(data.flag != 'F'){
        routing = `/form_builder?f=${data.enc_flag}`
    }else{
        routing = `/form_builder?flag=${data.enc_flag}`
    }
    res.redirect(routing)
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

FBRouter.get('/map_builder_question', async (req, res) => {
    var data = req.query
    var res_dt = await db_Select('id, scope_id, sec_id, input_label', 'md_cal_form_builder', `scope_id=${data.scope} AND sec_id=${data.type_id} AND lang_flag='${data.flag}'`, null)
    res.send(res_dt)
})

module.exports = {FBRouter}