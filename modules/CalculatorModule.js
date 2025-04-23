const {db_Select, db_Insert} = require("./MasterModule")
const dateFormat = require("dateformat");
module.exports = {
    getUnitList: (id = 0, flag='E') => {
        return new Promise(async (resolve, reject) => {
            var select = 'id, unit_name', 
            table_name = 'md_unit',
            whr = `flag = '${flag}' ${id > 0 ? `AND id = ${id}` : ''}`,
            order = 'ORDER BY unit_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveUnit: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'md_unit',
            fields = data.id > 0 ? `unit_name = "${data.unit_name}", modified_by = '${user}', modified_dt = '${datetime}'` : 
            '(flag, unit_name, created_by, created_dt)',
            values = `('${data.flag}', "${data.unit_name}", '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getCalTypeList: (id = 0, flag = 'E') => {
        return new Promise(async (resolve, reject) => {
            var select = 'id, type_name, type, scope', 
            table_name = 'md_cal_type',
            whr = `flag = '${flag}' ${id > 0 ? `AND id = ${id}` : ''}`,
            order = 'ORDER BY type_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveCalType: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'md_cal_type',
            fields = data.id > 0 ? `type_name = "${data.type_name}", type = "${data.type}", scope = '${data.scope}', modified_by = '${user}', modified_dt = '${datetime}'` : 
            '(flag, type_name, type, scope, created_by, created_dt)',
            values = `('${data.flag}', "${data.type_name}", "${data.type}", '${data.scope}', '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getCalAct: (id = 0, type_id = 0, flag='E') => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.type_id, a.act_name, b.type_name',
            table_name = 'md_cal_act a, md_cal_type b',
            whr = `a.type_id=b.id AND a.flag = '${flag}' ${id > 0 ? `AND a.id = ${id}` : ''} ${type_id > 0 ? `AND a.type_id = ${type_id}` : ''}`,
            order = 'ORDER BY a.act_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveCalAct: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'md_cal_act',
            fields = data.id > 0 ? `type_id = '${data.type_id}', act_name = "${data.act_name}", modified_by = '${user}', modified_dt = '${datetime}'` : 
            '(flag, type_id, act_name, created_by, created_dt)',
            values = `('${data.flag}', '${data.type_id}', "${data.act_name}", '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getCalEmiType: (id = 0, type_id = 0, act_id = 0, flag = 'E') => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.type_id, b.type_name, a.act_id, c.act_name, a.emi_name',
            table_name = 'md_cal_emi_type a, md_cal_type b, md_cal_act c',
            whr = `a.type_id=b.id AND a.act_id=c.id AND a.flag = '${flag}' ${id > 0 ? `AND a.id = ${id}` : ''} ${type_id > 0 ? `AND a.type_id = ${type_id}` : ''} ${act_id > 0 ? `AND a.act_id = ${act_id}` : ''}`,
            order = 'ORDER BY a.emi_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveCalEmiType: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'md_cal_emi_type',
            fields = data.id > 0 ? `type_id = '${data.type_id}', act_id = '${data.act_id}', emi_name = "${data.emi_name}", modified_by = '${user}', modified_dt = '${datetime}'` : 
            '(flag, type_id, act_id, emi_name, created_by, created_dt)',
            values = `('${data.flag}', '${data.type_id}', '${data.act_id}', "${data.emi_name}", '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getCalEmiVal: (id = 0, type_id = 0, act_id = 0, emi_type_id=0, unit_id=0, dashboard_flag = 'N', flag = 'E') => {
        return new Promise(async (resolve, reject) => {
            var select = dashboard_flag == 'Y' ? 'a.type_id, b.type_name, b.type, a.act_id, c.act_name, a.emi_type_id, d.emi_name, a.repo_period' : 'a.id, a.type_id, b.type_name, b.type, a.act_id, c.act_name, a.emi_type_id, d.emi_name, a.unit_id, e.unit_name, a.co_val',
            table_name = 'md_cal_emi_val a, md_cal_type b, md_cal_act c, md_cal_emi_type d, md_unit e',
            whr = `a.type_id=b.id AND a.act_id=c.id AND a.emi_type_id=d.id AND a.unit_id=e.id AND a.flag = '${flag}' ${id > 0 ? `AND a.id = ${id}` : ''} ${type_id > 0 ? `AND a.type_id = ${type_id}` : ''} ${act_id > 0 ? `AND a.act_id = ${act_id}` : ''} ${emi_type_id > 0 ? `AND a.emi_type_id = ${emi_type_id}` : ''} ${unit_id > 0 ? `AND a.unit_id = ${unit_id}` : ''}`,
            order = dashboard_flag == 'Y' ? 'GROUP BY a.type_id, a.act_id, a.emi_type_id, a.repo_period' : null;
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveCalEmiVal: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var res_dt;
            if(Array.isArray(data.unit_id) && Array.isArray(data.co_val)){
                for(let i=0; i<data.unit_id.length; i++){
                    var select = 'id',
                        table_name = 'md_cal_emi_val',
                        whr = `type_id = ${data.type_id} AND act_id = ${data.act_id} AND emi_type_id = ${data.emi_type_id} AND unit_id = ${data.unit_id[i]} AND repo_period = ${data.repo_period} AND flag = '${data.flag}'`,
                        order = null;
                    var chk_dt = await db_Select(select, table_name, whr, order)

                    var table_name = 'md_cal_emi_val',
                        fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `type_id = '${data.type_id}', act_id = '${data.act_id}', emi_type_id = '${data.emi_type_id}', repo_period = ${data.repo_period}, unit_id = '${data.unit_id[i]}', co_val = '${data.co_val[i]}', modified_by = '${user}', modified_dt = '${datetime}'` : 
                        '(flag, type_id, act_id, emi_type_id, repo_period, unit_id, co_val, created_by, created_dt)',
                        values = `('${data.flag}', '${data.type_id}', '${data.act_id}', '${data.emi_type_id}', ${data.repo_period}, '${data.unit_id[i]}', '${data.co_val[i]}', '${user}', '${datetime}')`,
                        whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
                        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
                    res_dt = await db_Insert(table_name, fields, values, whr, flag)
                }
                resolve(res_dt)
            }else{
                var select = 'id',
                    table_name = 'md_cal_emi_val',
                    whr = `type_id = ${data.type_id} AND act_id = ${data.act_id} AND emi_type_id = ${data.emi_type_id} AND unit_id = ${data.unit_id} AND repo_period = ${data.repo_period} AND flag = '${data.flag}'`,
                    order = null;
                var chk_dt = await db_Select(select, table_name, whr, order)

                var table_name = 'md_cal_emi_val',
                    fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `type_id = '${data.type_id}', act_id = '${data.act_id}', emi_type_id = '${data.emi_type_id}', repo_period = ${data.repo_period}, unit_id = '${data.unit_id}', co_val = '${data.co_val}', modified_by = '${user}', modified_dt = '${datetime}'` : 
                    '(flag, type_id, act_id, emi_type_id, repo_period, unit_id, co_val, created_by, created_dt)',
                    values = `('${data.flag}', '${data.type_id}', '${data.act_id}', '${data.emi_type_id}', ${data.repo_period}, '${data.unit_id}', '${data.co_val}', '${user}', '${datetime}')`,
                    whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
                    flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
                res_dt = await db_Insert(table_name, fields, values, whr, flag)
                resolve(res_dt);
            }
        })
    },
    getCalUnitList: (type_id = 0, act_id = 0, emi_type_id=0, year=0, flag = 'E') => {
        return new Promise(async (resolve, reject) => {
            var select = 'DISTINCT a.unit_id, b.unit_name, a.co_val',
                table_name = 'md_cal_emi_val a, md_unit b',
                whr = `a.unit_id=b.id AND a.flag = '${flag}' ${type_id > 0 ? `AND a.type_id = ${type_id}` : ''} ${act_id > 0 ? `AND a.act_id = ${act_id}` : ''} ${emi_type_id > 0 ? `AND a.emi_type_id = ${emi_type_id}` : ''} ${year > 0 ? `AND a.repo_period = ${year}` : ''}`,
                order = null;
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    getCalQuestUserDt: (scope_id = 1, proj_id, client_id, proj_year, flag = 'E') => {
        return new Promise(async (resolve, reject) => {
            var res_dt = {suc:0, msg:[]}
            var select = 'id, sec_name',
            whr = `scope_id = ${scope_id} AND lang_flag = '${flag}'`,
            order = null;
            var cal_sec_dt = await db_Select(select,'md_cal_sec_type', whr, order)
            if(cal_sec_dt.suc > 0 && cal_sec_dt.msg.length > 0){
                var newData = {}, calNewData = {}, calQuestDt = {};
                for(let dt of cal_sec_dt.msg){
                    var q_select = `a.id, a.scope_id, a.sec_id pro_sec_id, a.input_type, a.input_label, a.input_heading, a.sequence, a.is_parent, a.parent_id, a.is_sub_parent, a.sub_parent_id, b.id logic_id, b.option_val, b.action_val, b.next_qst_action_val, b.emi_head_opt1, b.emi_head_opt2, b.emi_head_opt3, '' qu_option`,
                    q_whr = `a.id = b.quest_id AND a.lang_flag = '${flag}' AND a.scope_id = ${scope_id} AND a.sec_id = ${dt.id} AND a.header_flag = 'N'`;
                    var qstDtlsAndLogic = await db_Select(q_select, 'md_cal_form_builder a, md_cal_form_build_logic b', q_whr, null)
                    if(qstDtlsAndLogic.suc > 0 && qstDtlsAndLogic.msg.length > 0){
                        for(let qdt of qstDtlsAndLogic.msg){
                            if(['R','C', 'S'].includes(qdt.input_type)){
                                var o_select = 'id, option_name',
                                o_whr = `scope_id= ${scope_id} AND sec_id= ${dt.id} AND builder_id=${qdt.id}`;
                                var opt_val = await db_Select(o_select, 'md_cal_form_builder_option', o_whr, null)
                                // console.log(opt_val);
                                qdt['qu_option'] = opt_val.suc > 0 && opt_val.msg.length > 0 ? opt_val.msg : []
                            }else{
                                qdt['qu_option'] = []
                            }
                        }
                    }
                    try{
                        var calSel = `a.id, a.client_id, a.scope, a.project_id, a.quest_id, a.sl_no, a.sec_id, a.act_id, a.emi_type_id, a.repo_period, a.repo_month, a.repo_mode_label, a.emi_type_unit_id, a.cal_val, a.emi_fact_val, a.co_val, c.act_name, d.emi_name, b.sequence, b.parent_id, b.sub_parent_id`,
                        calWhr = `a.quest_id=b.id AND a.act_id=c.id AND a.emi_type_id=d.id AND a.project_id = ${proj_id} AND a.scope = ${scope_id} AND a.client_id = ${client_id} AND a.repo_period='${proj_year}' AND b.sec_id = ${dt.id}`;
                        var calVal = await db_Select(calSel, 'td_ghg_quest_cal a, md_cal_form_builder b, md_cal_act c, md_cal_emi_type d', calWhr, `ORDER BY a.sl_no`)
                        calNewData[dt.sec_name] = calVal.suc > 0 ? (calVal.msg.length > 0 ? calVal.msg : []) : []
                    }catch(err){
                        console.log(err);
                        calNewData[dt.sec_name] = []
                    }
                    try{
                        var calQuestList = await db_Select('a.*, b.input_label, b.input_heading, b.input_type', 'td_ghg_quest a, md_cal_form_builder b', `a.quest_id=b.id AND a.proj_year='${proj_year}' AND a.client_id=${client_id} AND a.scope=${scope_id} AND a.project_id=${proj_id} AND b.sec_id = ${dt.id}`, `ORDER BY a.pro_sl_no, a.quest_seq`)
                        // console.log(calQuestList);
                        
                        calQuestDt[dt.sec_name] = calQuestList.suc > 0 ? (calQuestList.msg.length > 0 ? calQuestList.msg : []) : []
                    }catch(err){
                        console.log(err);
                        calQuestDt[dt.sec_name] = []
                    }
                    newData[dt.sec_name] = qstDtlsAndLogic.suc > 0 ? qstDtlsAndLogic.msg : []
                }
                var q_ans_dt = await db_Select('*', 'td_ghg_quest', `client_id=${client_id} AND scope=${scope_id} AND project_id=${proj_id} AND proj_year='${proj_year}'`)
                res_dt = {suc: 1, msg: newData, proj_q_ans_dt: q_ans_dt.suc > 0 && q_ans_dt.msg.length > 0 ? q_ans_dt.msg : [], cal_val: calNewData, quest_ans_sec: calQuestDt}
            }else{
                res_dt = cal_sec_dt
            }
            resolve(res_dt)
        })
    },
    getGhgCalList: (proj_id, client_id, period) => {
        return new Promise(async (resolve, reject) => {
            var calSel = `a.id, a.client_id, a.scope, a.project_id, a.quest_id, a.sl_no, a.sec_id, a.act_id, a.emi_type_id, a.repo_period, a.repo_month, a.repo_mode_label, a.emi_type_unit_id, a.cal_val, a.emi_fact_val, a.co_val, c.act_name, d.emi_name, b.sec_id cal_sec_id, b.sequence, b.parent_id, b.sub_parent_id`,
                calWhr = `a.quest_id=b.id AND a.act_id=c.id AND a.emi_type_id=d.id AND a.project_id = ${proj_id} AND a.client_id = ${client_id} AND a.repo_period=${period}`;
            var calVal = await db_Select(calSel, 'td_ghg_quest_cal a, md_cal_form_builder b, md_cal_act c, md_cal_emi_type d', calWhr, `ORDER BY a.scope, a.sl_no`)
            resolve(calVal)
        })
    },
    getGhgQuestList: (proj_id, client_id, period) => {
        return new Promise(async (resolve, reject) => {
            var calSel = `a.*, b.sec_id`,
                calWhr = `a.quest_id=b.id AND a.client_id = ${client_id} AND a.project_id = ${proj_id} AND a.proj_year = ${period} AND a.end_flag != 'N'`;
            var calVal = await db_Select(calSel, 'td_ghg_quest a, md_cal_form_builder b', calWhr, `ORDER BY a.scope, a.pro_sl_no`)
            resolve(calVal)
        })
    }
}