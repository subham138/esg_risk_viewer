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
    var scope_dt = SCOPE_LIST, data = req.query, qr_dt = {}, q_header = '', tabs_dt = [],
    flag = data.flag ? Buffer.from(data.flag, 'base64').toString() : 'E',
    sec_list = await db_Select('id, scope_id, sec_name', 'md_cal_sec_type', data.scope > 0 ? `lang_flag = '${flag}' AND scope_id = ${data.scope}` : `lang_flag = '${flag}'`, null);
    if(data.scope > 0 && data.type_id > 0){
        var resDt = await db_Select('*', 'md_cal_form_builder', `scope_id=${data.scope} AND sec_id=${data.type_id} AND lang_flag = '${flag}'`, 'ORDER BY sequence asc, id asc')
        if(resDt.suc > 0){
            var headerFilterDt = resDt.msg.filter(dt => dt.header_flag != 'N')
            var questFilterData = resDt.msg.filter(dt => dt.header_flag != 'Y')
            qr_dt = questFilterData
            if(headerFilterDt.length > 0) q_header = headerFilterDt[0].input_label
            for(let dt of questFilterData){
                if(dt.input_type != 'I'){
                    var opDt = await db_Select('id, builder_id, option_name', 'md_cal_form_builder_option', `builder_id=${dt.id} AND sec_id=${data.type_id}`, 'ORDER BY id asc')
                    dt['options'] = opDt.suc > 0 ? opDt.msg : []
                }
            }
        }
        var tabsRes = await db_Select('*', 'md_cal_form_builder_tabs', `scope_id=${data.scope} AND sec_id=${data.type_id} AND lang_flag = '${flag}'`, 'ORDER BY tab_serial asc');
        if(tabsRes.suc > 0){
            tabs_dt = tabsRes.msg;
        }
    }
    
    res.render('form_builder/entry', {scope: scope_dt, qr_dt, q_header, tabs_dt, scope_id: data.scope, sec_id: data.type_id, sec_list: sec_list.suc > 0 ? sec_list.msg : [], flag})
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
            var scopeId = parseInt(data.scope_id);
            var secId = parseInt(data.sec_id);
            var langFlag = safeStr(data.lang_flag) || 'E';

            // 1. Manage Dynamic Tabs (Re-sync tabs for this section)
            await db_Delete('md_cal_form_builder_tabs', `scope_id = ${scopeId} AND sec_id = ${secId} AND lang_flag = '${langFlag}'`);
            var rawTabs = data.tab_titles !== undefined && data.tab_titles !== null ? (Array.isArray(data.tab_titles) ? data.tab_titles : [data.tab_titles]) : [];
            for(let t = 0; t < rawTabs.length; t++){
                let tTitle = safeStr(rawTabs[t]).trim();
                if(tTitle.length > 0){
                    let tabFields = `(lang_flag, scope_id, sec_id, tab_serial, tab_title, created_by, created_dt)`;
                    let tabValues = `('${langFlag}', ${scopeId}, ${secId}, ${t + 1}, '${tTitle}', '${user_name}', '${datetime}')`;
                    await db_Insert('md_cal_form_builder_tabs', tabFields, tabValues, null, 0);
                }
            }

            // 2. Manage Header Row (UPDATE if exists, else INSERT)
            var headerText = safeStr(data.header);
            var chkHeader = await db_Select('id', 'md_cal_form_builder', `scope_id = ${scopeId} AND sec_id = ${secId} AND lang_flag = '${langFlag}' AND header_flag = 'Y'`, null);
            if(chkHeader.suc > 0 && chkHeader.msg.length > 0){
                let headId = chkHeader.msg[0].id;
                await db_Insert('md_cal_form_builder', `input_label = '${headerText}', modified_by = '${user_name}', modified_dt = '${datetime}'`, null, `id = ${headId}`, 1);
            } else {
                let headFields = `(lang_flag, scope_id, sec_id, input_label, header_flag, created_by, created_dt)`;
                let headValues = `('${langFlag}', ${scopeId}, ${secId}, '${headerText}', 'Y', '${user_name}', '${datetime}')`;
                await db_Insert('md_cal_form_builder', headFields, headValues, null, 0);
            }

            // 3. Pre-fetch existing question IDs (header_flag = 'N') to detect deleted cards
            var existingRowsRes = await db_Select('id', 'md_cal_form_builder', `scope_id = ${scopeId} AND sec_id = ${secId} AND lang_flag = '${langFlag}' AND header_flag = 'N'`, null);
            var existingQuestionIds = (existingRowsRes.suc > 0 && existingRowsRes.msg.length > 0) ? existingRowsRes.msg.map(r => r.id) : [];

            // 4. Pre-process parent sequences for auto-hiding child questions logic
            const hiddenParentSeqs = new Set();
            for (let i = 0; i < cardList.length; i++) {
                let id = cardList[i];
                let pVal = parseInt(data[`p_c_${id}`]) || 0;
                let psVal = parseInt(data[`p_s_c_${id}`]) || 0;
                let isParent = (pVal > 0 || psVal > 0) ? 'N' : 'Y';
                let hideChildFlag = data[`hide_child_${id}`] === 'Y' ? 'Y' : 'N';
                let seq = parseInt(data[`s_${id}`]) || (i + 1);

                if (isParent === 'Y' && hideChildFlag === 'Y') {
                    hiddenParentSeqs.add(seq);
                }
            }

            const processedQDbIds = new Set();

            // 5. UPSERT (In-place UPDATE for existing rows, INSERT for new ones)
            for(let i = 0; i < cardList.length; i++){
                let id = cardList[i];
                let qDbId = parseInt(data[`qid_${id}`]) || 0;

                let optionKey = data[`option_${id}`] ? (Array.isArray(data[`option_${id}`]) ? data[`option_${id}`][0] : data[`option_${id}`]) : 'short_text';
                let inputType = INPUT_TYPE_LIST[optionKey] || 'I';
                let qLabel = safeStr(data[`q_${id}`]);
                let qHeading = safeStr(data[`hed_${id}`]);
                let seq = parseInt(data[`s_${id}`]) || (i + 1);
                let pVal = parseInt(data[`p_c_${id}`]) || 0;
                let psVal = parseInt(data[`p_s_c_${id}`]) || 0;
                let isParent = (pVal > 0 || psVal > 0) ? 'N' : 'Y';
                let isSubParent = (psVal > 0) ? 'N' : 'Y';

                // Controls for Parent & Sub-Parent
                let hideChildFlag = data[`hide_child_${id}`] === 'Y' ? 'Y' : 'N';
                let showInfoFlag = data[`show_info_${id}`] === 'Y' ? 'Y' : 'N';
                let hideFlag = data[`hide_ques_${id}`] === 'Y' ? 'Y' : 'N';
                
                // Logic Enhancement: If parent sequence has hide_child_flag set to 'Y', automatically set child hide_flag to 'Y'
                if (pVal > 0 && hiddenParentSeqs.has(pVal)) {
                    hideFlag = 'Y';
                }

                let belongsToTab = data[`belongs_to_tab_${id}`] === 'Y' ? 'Y' : 'N';
                let tabSerialNo = parseInt(data[`tab_serial_${id}`]) || 0;
                let tabSerialVal = (belongsToTab === 'Y' && tabSerialNo > 0) ? tabSerialNo : 'NULL';

                let builder_id = 0;

                if (qDbId > 0 && existingQuestionIds.includes(qDbId)) {
                    // UPDATE existing question row in place to preserve primary key ID and build logic mapping
                    let updateFields = `input_type = '${inputType}', input_label = '${qLabel}', input_heading = '${qHeading}', sequence = ${seq}, is_parent = '${isParent}', parent_id = ${pVal}, is_sub_parent = '${isSubParent}', sub_parent_id = ${psVal}, hide_child_flag = '${hideChildFlag}', show_info_flag = '${showInfoFlag}', hide_flag = '${hideFlag}', belongs_to_tab = '${belongsToTab}', tab_serial_no = ${tabSerialVal}, modified_by = '${user_name}', modified_dt = '${datetime}'`;
                    await db_Insert('md_cal_form_builder', updateFields, null, `id = ${qDbId}`, 1);
                    builder_id = qDbId;
                    processedQDbIds.add(qDbId);
                } else {
                    // INSERT new question row
                    let fields = `(lang_flag, scope_id, sec_id, input_type, input_label, input_heading, sequence, is_parent, parent_id, is_sub_parent, sub_parent_id, hide_child_flag, show_info_flag, hide_flag, belongs_to_tab, tab_serial_no, header_flag, created_by, created_dt)`;
                    let values = `('${langFlag}', ${scopeId}, ${secId}, '${inputType}', '${qLabel}', '${qHeading}', '${seq}', '${isParent}', '${pVal}', '${isSubParent}', '${psVal}', '${hideChildFlag}', '${showInfoFlag}', '${hideFlag}', '${belongsToTab}', ${tabSerialVal}, 'N', '${user_name}', '${datetime}')`;
                    
                    let resDt = await db_Insert('md_cal_form_builder', fields, values, null, 0);
                    builder_id = (resDt.suc > 0 && resDt.lastId) ? resDt.lastId.insertId : 0;
                    if (builder_id > 0) {
                        processedQDbIds.add(builder_id);
                    }
                }

                // 6. Manage Options for this builder_id (UPSERT to preserve option primary keys)
                if (builder_id > 0) {
                    if (['radio', 'check', 'drop'].includes(optionKey)) {
                        let rawOpts = data[`q_s_${id}`];
                        let optList = Array.isArray(rawOpts) ? rawOpts : (rawOpts !== undefined && rawOpts !== null ? [rawOpts] : []);
                        
                        let rawOpIds = data[`op_id_${id}`];
                        let opIdList = Array.isArray(rawOpIds) ? rawOpIds : (rawOpIds !== undefined && rawOpIds !== null ? [rawOpIds] : []);

                        let existingOptsRes = await db_Select('id', 'md_cal_form_builder_option', `builder_id = ${builder_id}`, null);
                        let existingOptIds = (existingOptsRes.suc > 0 && existingOptsRes.msg.length > 0) ? existingOptsRes.msg.map(r => r.id) : [];

                        let processedOptIds = new Set();

                        for(let o = 0; o < optList.length; o++){
                            let optName = safeStr(optList[o]).trim();
                            let opId = parseInt(opIdList[o]) || 0;

                            if (optName.length > 0) {
                                if (opId > 0 && existingOptIds.includes(opId)) {
                                    // UPDATE existing option in place to preserve option primary key ID
                                    let updateOptFields = `option_name = '${optName}', modified_by = '${user_name}', modified_dt = '${datetime}'`;
                                    await db_Insert('md_cal_form_builder_option', updateOptFields, null, `id = ${opId}`, 1);
                                    processedOptIds.add(opId);
                                } else {
                                    // INSERT new option
                                    let optFields = `(scope_id, sec_id, builder_id, option_name, created_by, created_dt)`;
                                    let optValues = `(${scopeId}, ${secId}, ${builder_id}, '${optName}', '${user_name}', '${datetime}')`;
                                    let insOptRes = await db_Insert('md_cal_form_builder_option', optFields, optValues, null, 0);
                                    let newOptId = (insOptRes.suc > 0 && insOptRes.lastId) ? insOptRes.lastId.insertId : 0;
                                    if (newOptId > 0) processedOptIds.add(newOptId);
                                }
                            }
                        }

                        // Delete ONLY options removed by admin for this builder_id
                        let deletedOptIds = existingOptIds.filter(oId => !processedOptIds.has(oId));
                        if (deletedOptIds.length > 0) {
                            await db_Delete('md_cal_form_builder_option', `id IN (${deletedOptIds.join(',')})`);
                        }
                    } else {
                        // If type changed from option to text/non-option, remove options for this builder_id
                        await db_Delete('md_cal_form_builder_option', `builder_id = ${builder_id}`);
                    }
                }
            }

            // 7. Delete ONLY questions that were deleted by the admin from the form builder UI
            let deletedQuestionIds = existingQuestionIds.filter(id => !processedQDbIds.has(id));
            if (deletedQuestionIds.length > 0) {
                let delIdsStr = deletedQuestionIds.join(',');
                await db_Delete('md_cal_form_builder_option', `builder_id IN (${delIdsStr})`);
                await db_Delete('md_cal_form_build_logic', `quest_id IN (${delIdsStr})`);
                await db_Delete('md_cal_form_build_map_quest', `p_f_builder_id IN (${delIdsStr}) OR c_f_builder_id IN (${delIdsStr})`);
                await db_Delete('md_cal_form_builder', `id IN (${delIdsStr})`);
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