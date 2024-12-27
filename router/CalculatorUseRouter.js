const CalcUserRouter = require('express').Router(),
{ getCalQuestUserDt, getCalAct, getGhgCalList } = require('../modules/CalculatorModule'),
{ SCOPE_LIST, YEAR_LIST, PROJECT_LIST, db_Insert, db_Select, db_Delete } = require('../modules/MasterModule'),
{ getProjectList } = require('../modules/ProjectModule'),
dateFormat = require('dateformat');

CalcUserRouter.get('/cal_fetch_quest', async (req, res) => {
  var scope_list = SCOPE_LIST,
  cal_act = await getCalAct(0, 0),
  currDate = new Date(),
  yearList = YEAR_LIST;
  var currYear = currDate.getFullYear()
  yearList.includes(currYear) ? '' : yearList.push(currYear)
    var data = {
        header: "Manage User",
        scope_list,
        cal_act: cal_act.suc > 0 ? cal_act.msg : [],
        year_list: yearList
      };
    // console.log(yearList, currYear, yearList.includes(currYear));
      
    res.render('calc_user/quest_entry', data)
})

CalcUserRouter.post('/get_question_list_by_scope_user_ajax', async (req, res) => {
  var data = req.body
  var res_dt = await getCalQuestUserDt(data.scope_id > 0 ? data.scope_id : 1, data.proj_id, req.session.user.client_id, data.sel_year, data.flag)
  res.send(res_dt)
})

CalcUserRouter.get('/cal_proj_report_view', async (req, res) => {
  var enc_data = req.query.enc_data,
    data_set = {},
    client_id = req.session.user.client_id;
  var data = Buffer.from(enc_data, "base64");
  data = JSON.parse(data),
  currDate = new Date();

  var currYrSel = 'a.repo_period, a.scope, SUM(a.tot_co_val_sc1) tot_co_val_sc1, SUM(a.tot_co_val_sc2) tot_co_val_sc2, SUM(a.tot_co_val_sc3) tot_co_val_sc3',
  currYrWhr = null,
  currYrFrm = `(
SELECT repo_period, scope, SUM(co_val) tot_co_val_sc1, 0 tot_co_val_sc2, 0 tot_co_val_sc3 FROM td_ghg_quest_cal WHERE project_id = '${data.proj_id}' AND repo_period = '${currDate.getFullYear()}' AND scope = 1
UNION
SELECT repo_period, scope, 0 tot_co_val_sc1, SUM(co_val) tot_co_val_sc2, 0 tot_co_val_sc3 FROM td_ghg_quest_cal WHERE project_id = '${data.proj_id}' AND repo_period = '${currDate.getFullYear()}' AND scope = 2
UNION
SELECT repo_period, scope, 0 tot_co_val_sc1, 0 tot_co_val_sc2, SUM(co_val) tot_co_val_sc3 FROM td_ghg_quest_cal WHERE project_id = '${data.proj_id}' AND repo_period = '${currDate.getFullYear()}' AND scope = 3
) a`,
  currYrOrder = 'GROUP BY a.repo_period, a.scope HAVING a.repo_period IS NOT null';
  var currYearCalData = await db_Select(currYrSel, currYrFrm, currYrWhr, currYrOrder)

var dashScopeCalData = await db_Select(`SUM(a.less_yr_sc1) less_yr_sc1, SUM(a.grt_year_sc1) grt_year_sc1, SUM(a.less_year_sc2) less_yr_sc2, SUM(a.grt_year_sc2) grt_year_sc2, SUM(a.less_year_sc3) less_yr_sc3, SUM(a.grt_year_sc3) grt_year_sc3`, `(
SELECT COUNT(trans_year) less_yr_sc1, 0 grt_year_sc1, 0 less_year_sc2, 0 grt_year_sc2, 0 less_year_sc3, 0 grt_year_sc3
FROM td_trans_plan
WHERE client_id = ${client_id} AND proj_id = '${data.proj_id}' AND (path_sc_1 - act_sc_1) <= 0
UNION
SELECT 0 less_yr_sc1, COUNT(trans_year) grt_year_sc1, 0 less_year_sc2, 0 grt_year_sc2, 0 less_year_sc3, 0 grt_year_sc3
FROM td_trans_plan
WHERE client_id = ${client_id} AND proj_id = '${data.proj_id}' AND (path_sc_1 - act_sc_1) > 0
UNION
SELECT 0 less_yr_sc1, 0 grt_year_sc1, COUNT(trans_year) less_year_sc2, 0 grt_year_sc2, 0 less_year_sc3, 0 grt_year_sc3
FROM td_trans_plan
WHERE client_id = ${client_id} AND proj_id = '${data.proj_id}' AND (path_sc_2 - act_sc_2) <= 0
UNION
SELECT 0 less_yr_sc1, 0 grt_year_sc1, 0 less_year_sc2, COUNT(trans_year) grt_year_sc2, 0 less_year_sc3, 0 grt_year_sc3
FROM td_trans_plan
WHERE client_id = ${client_id} AND proj_id = '${data.proj_id}' AND (path_sc_2 - act_sc_2) > 0
UNION
SELECT 0 less_yr_sc1, 0 grt_year_sc1, 0 less_year_sc2, 0 grt_year_sc2, COUNT(trans_year) less_year_sc3, 0 grt_year_sc3
FROM td_trans_plan
WHERE client_id = ${client_id} AND proj_id = '${data.proj_id}' AND (path_sc_2 - act_sc_2) <= 0
UNION
SELECT 0 less_yr_sc1, 0 grt_year_sc1, 0 less_year_sc2, 0 grt_year_sc2, 0 less_year_sc3, COUNT(trans_year) grt_year_sc3
FROM td_trans_plan
WHERE client_id = ${client_id} AND proj_id = '${data.proj_id}' AND (path_sc_3 - act_sc_3) > 0
)a`, null, null)
  
  // console.log(currYearCalData);

  

  var transData = await db_Select('*', 'td_trans_plan', `proj_id=${data.proj_id} AND client_id = ${client_id}`, 'ORDER BY trans_year ASC')

  var getAllGhgCalDt = await getGhgCalList(data.proj_id, client_id)
  // console.log(getAllGhgCalDt, 'GHG DT');
  

  var project_data = await getProjectList(
    data.proj_id,
    req.session.user.client_id,
    0,
    data.flag,
    req.session.user.platform_mode
  );

  var scope_list = SCOPE_LIST,
  cal_act = await getCalAct(0, 0, data.flag == 'IC' ? 'E' : 'F'),
  yearList = YEAR_LIST;
  var currYear = currDate.getFullYear()
  yearList.includes(currYear) ? '' : yearList.push(currYear)

  // console.log(data.flag, 'Flag');
  

  var res_data = {
    top_id: data.top_id,
    sec_id: data.sec_id,
    ind_id: data.ind_id,
    project_id: data.proj_id,
    projName: data.proj_name,
    repo_type: data.repo_type,
    user_type: req.session.user.user_type,
    ai_tag_tool_flag: req.session.user.ai_tag_tool_flag,
    project_data: project_data.suc > 0 ? project_data.msg : [],
    header: "Project List",
    header_url: `/my_project?flag=${encodeURIComponent(
      new Buffer.from(data.flag == 'I' ? 'IC' : 'FC').toString("base64")
    )}`,
    flag: data.flag == 'I' ? 'E' : 'F',
    cal_lang_flag: req.session.user.cal_lang_flag,
    flag_name: PROJECT_LIST[data.flag],
    scope_list,
    cal_act: cal_act.suc > 0 ? cal_act.msg : [],
    year_list: yearList,
    curr_yr_cal_dt: currYearCalData.suc > 0 ? currYearCalData.msg : [],
    currYear,
    trans_data: transData.suc > 0 ? transData.msg.length > 0 ? transData.msg : [] : [],
    allGhgList: getAllGhgCalDt.suc > 0 ? getAllGhgCalDt.msg.length > 0 ? getAllGhgCalDt.msg : [] : [],
    dash_sc_cal: dashScopeCalData.suc > 0 ? (dashScopeCalData.msg.length > 0 ? dashScopeCalData.msg : []) : []
  };
  res.render("calculator_project/report_view", res_data)
})

CalcUserRouter.post('/cal_quest_save', async (req, res) => {
  var enc_dt = req.body.enc_dt, quest_ans = req.body.quest_ans, dateTime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'), currDate = dateFormat(new Date(), 'yyyy-mm-dd'), user = req.session.user;
  var data = new Buffer.from(enc_dt, 'base64').toString()
  data = JSON.parse(data)

  var ansChk = await db_Select('count(a.id) tot_row', 'td_ghg_quest a, md_cal_form_builder b', `a.quest_id=b.id AND a.client_id = ${user.client_id} AND a.project_id = ${data.proj_id} AND a.scope = ${data.scope_id} AND b.scope_id = ${data.quest_sec_id} AND a.end_flag = 'N' AND a.quest_seq != '1.'`, null)

  // console.log(ansChk, 'Chk DT');

  var maxQuestSlNo =  await db_Select('IF(max(pro_sl_no) > 0, max(pro_sl_no), 0) max_no', 'td_ghg_quest a, md_cal_form_builder b', `a.quest_id=b.id AND a.client_id = ${user.client_id} AND a.project_id = ${data.proj_id} AND a.scope = ${data.scope_id} AND b.scope_id = ${data.quest_sec_id} AND a.end_flag = '${ansChk.suc > 0 && ansChk.msg.length > 0 ? (ansChk.msg[0].tot_row > 0 ? 'N' : 'Y') : 'Y'}'`, null)

  // console.log(maxQuestSlNo, 'Max CHk');
  

  maxQuestSlNo = ansChk.suc > 0 && ansChk.msg.length > 0 ? (ansChk.msg[0].tot_row > 0 ? (maxQuestSlNo.suc > 0 ? parseInt(maxQuestSlNo.msg[0].max_no) : 1) : (maxQuestSlNo.suc > 0 ? parseInt(maxQuestSlNo.msg[0].max_no)+1 : 1)) : 1
  // console.log(maxQuestSlNo, 'sl_no');
  
  

  var chk_dt = await db_Select('id', 'td_ghg_quest', `client_id = ${user.client_id} AND project_id = ${data.proj_id} AND quest_id = ${data.quest_id} AND scope = ${data.scope_id} AND end_flag = 'N'`)

  var table_name = 'td_ghg_quest',
  fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `quest_ans = '${quest_ans}', modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, scope, project_id, pro_sl_no, entry_dt, quest_id, quest_type, quest_seq, quest_ans, created_by, created_dt)',
  values = `(${user.client_id}, '${data.scope_id}', ${data.proj_id}, ${maxQuestSlNo}, '${currDate}', ${data.quest_id}, '${data.quest_type}', '${data.quest_seq}', '${quest_ans}', '${user.user_id}', '${dateTime}')`,
  whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
  flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag)
  res.send(res_dt)
})

CalcUserRouter.post('/get_cal_save_dt_ajax', async (req, res) => {
  var data = req.body, user = req.session.user;
  var res_dt = await db_Select('*', 'td_ghg_quest', `client_id=${user.client_id} AND scope_id=${data.scope_id} AND project_id=${data.proj_id}`)
})

CalcUserRouter.post('/save_co_cal_ajax', async (req, res) => {
  var {enc_dt, repo_period, strt_month, cal_val, emi_fact_val, co_val, mode_quest_id, mode_quest_val, quest_id, act_id, emi_id, unit_id, repo_mode_label, subSeq} = req.body

  cal_val = JSON.parse(cal_val)
  emi_fact_val = JSON.parse(emi_fact_val)
  co_val = JSON.parse(co_val)
  repo_mode_label = JSON.parse(repo_mode_label)

  var dateTime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'), 
  currDate = dateFormat(new Date(), 'yyyy-mm-dd'), 
  user = req.session.user, res_dt= {};

  var data = new Buffer.from(enc_dt, 'base64').toString()
  data = JSON.parse(data)

  var chk_dt = await db_Select('id', 'td_ghg_quest', `client_id = ${user.client_id} AND project_id = ${data.proj_id} AND quest_id = ${mode_quest_id} AND scope = ${data.scope_id}`)

  var table_name = 'td_ghg_quest',
  fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `quest_ans = '${mode_quest_val}', repo_start_year = '${repo_period}', repo_start_month = '${strt_month}', repo_start_date = 0, modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, scope, project_id, entry_dt, quest_id, quest_type, quest_seq, quest_ans, repo_start_year, repo_start_month, repo_start_date, created_by, created_dt)',
  values = `(${user.client_id}, '${data.scope_id}', ${data.proj_id}, '${currDate}', ${data.quest_id}, '${data.quest_type}', '${data.quest_seq}', '${mode_quest_val}', '${repo_period}', '${strt_month}', 0, '${user.user_id}', '${dateTime}')`,
  whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
  flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
  var quest_dt = await db_Insert(table_name, fields, values, whr, flag)
  
  if(cal_val.length > 0){
    var max_sl_no_dt = await db_Select('IF(MAX(sl_no) > 0, MAX(sl_no), 0)+1 next_sl_no', 'td_ghg_quest_cal', `scope=${data.scope_id} AND client_id = ${user.client_id} AND project_id=${data.proj_id} AND quest_id=${quest_id}`, null)
    var i = 0
    for(let dt of cal_val){
      if(co_val[i] > 0){
        var table_name = 'td_ghg_quest_cal',
        fields = `(client_id, scope, project_id, quest_id, sl_no, sec_id, act_id, emi_type_id, repo_period, repo_month, repo_mode_label, emi_type_unit_id, cal_val, emi_fact_val, co_val, created_by, created_dt)`,
        values = `(${user.client_id}, ${data.scope_id}, ${data.proj_id}, ${quest_id}, ${max_sl_no_dt.msg[0].next_sl_no}, ${data.sec_id}, ${act_id}, ${emi_id}, ${repo_period}, '${strt_month}', '${repo_mode_label[i]}', ${unit_id}, ${dt}, ${emi_fact_val[i]}, ${co_val[i]}, '${user.user_name}', '${dateTime}')`,
        whr = null,
        flag = 0;
        res_dt = await db_Insert(table_name, fields, values, whr, flag)
      }
      i++
    }

    try{
      await db_Insert('td_ghg_quest a, md_cal_form_builder b', `a.end_flag = 'Y', a.modified_by = '${user.user_id}', a.modified_dt = '${dateTime}'`, null, `a.quest_id=b.id AND a.client_id = ${user.client_id} AND a.project_id = ${data.proj_id} AND a.scope = ${data.scope_id} AND a.quest_seq LIKE "${subSeq}%" AND a.end_flag = 'N'`, 1)
    }catch(err){
      console.log(err);
    }
  }
  res.send(res_dt)
})

CalcUserRouter.post('/trans_val_save_ajax', async (req, res) => {
  var data = req.body,
  user = req.session.user,
  dateTime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');

  var table_name = 'td_trans_plan', values = '', fields = '', whr = data.id > 0 ? `id=${data.id}` : null, flag = data.id > 0 ? 1 : 0;
  switch (data.flag) {
    case 'aSc1':
      values = data.id > 0 ? null : `(${user.client_id}, ${data.proj_id}, ${data.emi_year}, ${data.trns_val}, '${user.user_id}', '${dateTime}')`
      fields = data.id > 0 ? `trans_year = ${data.emi_year}, act_sc_1 = ${data.trns_val}, modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, proj_id, trans_year, act_sc_1, created_by, created_dt)'
      break;
    case 'aSc2':
      values = data.id > 0 ? null : `(${user.client_id}, ${data.proj_id}, ${data.emi_year}, ${data.trns_val}, '${user.user_id}', '${dateTime}')`
      fields = data.id > 0 ? `trans_year = ${data.emi_year}, act_sc_2 = ${data.trns_val}, modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, proj_id, trans_year, act_sc_2, created_by, created_dt)'
      break;
    case 'aSc3':
      values = data.id > 0 ? null : `(${user.client_id}, ${data.proj_id}, ${data.emi_year}, ${data.trns_val}, '${user.user_id}', '${dateTime}')`
      fields = data.id > 0 ? `trans_year = ${data.emi_year}, act_sc_3 = ${data.trns_val}, modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, proj_id, trans_year, act_sc_3, created_by, created_dt)'
      break;
    case 'pSc1':
      values = data.id > 0 ? null : `(${user.client_id}, ${data.proj_id}, ${data.emi_year}, ${data.trns_val}, '${user.user_id}', '${dateTime}')`
      fields = data.id > 0 ? `trans_year = ${data.emi_year}, path_sc_1 = ${data.trns_val}, modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, proj_id, trans_year, path_sc_1, created_by, created_dt)'
      break;
    case 'pSc2':
      values = data.id > 0 ? null : `(${user.client_id}, ${data.proj_id}, ${data.emi_year}, ${data.trns_val}, '${user.user_id}', '${dateTime}')`
      fields = data.id > 0 ? `trans_year = ${data.emi_year}, path_sc_2 = ${data.trns_val}, modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, proj_id, trans_year, path_sc_2, created_by, created_dt)'
      break;
    case 'pSc3':
      values = data.id > 0 ? null : `(${user.client_id}, ${data.proj_id}, ${data.emi_year}, ${data.trns_val}, '${user.user_id}', '${dateTime}')`
      fields = data.id > 0 ? `trans_year = ${data.emi_year}, path_sc_3 = ${data.trns_val}, modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, proj_id, trans_year, path_sc_3, created_by, created_dt)'
      break;
  
    default:
      break;
  }
  var res_dt = await db_Insert(table_name, fields, values, whr, flag)
  res.send(res_dt)
})

CalcUserRouter.post('/get_trans_plan_note_ajax', async (req, res) => {
  var data = req.body,
  user = req.session.user;

  var res_dt = await db_Select('*', 'td_trans_pan_note', `proj_id = ${data.proj_id} AND trans_year = ${data.trans_year} AND client_id = ${user.client_id}`, 'ORDER BY sl_no ASC')

  res.send(res_dt)
})

CalcUserRouter.post('/save_trans_plan_note_ajax', async (req, res) => {
  var data = req.body,
  user = req.session.user,
  dateTime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');

  var max_sl_no = await db_Select('IF(max(sl_no) > 0, max(sl_no), 0)+1 max_sl_no', 'td_trans_pan_note', `proj_id = ${data.proj_id} AND trans_year = ${data.trans_year} AND client_id = ${user.client_id}`, 'ORDER BY sl_no ASC')

  var table_name = 'td_trans_pan_note',
  fields = data.id > 0 ? `trans_note = '${data.note != '' ? data.note.split("'").join("\\'") : ""}', modified_by = '${user.user_name}', modified_dt = '${dateTime}'` : '(client_id, proj_id, trans_year, sl_no, trans_note, created_by, created_dt)',
  values = `(${user.client_id}, ${data.proj_id}, ${data.trans_year}, ${max_sl_no.msg[0].max_sl_no}, '${data.note != '' ? data.note.split("'").join("\\'") : ""}', '${user.user_name}', '${dateTime}')`,
  whr = data.id > 0 ? `id = ${data.id}` : null,
  flag = data.id > 0 ? 1 : 0;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag)
  res_dt['sl_no'] = max_sl_no.msg[0].max_sl_no
  res.send(res_dt)
})

CalcUserRouter.post('/delete_ghg_ext_cal_mod_ajax', async (req, res) => {
  const {enc_dt} = req.body,
  client_id = req.session.user.client_id;
  var data = new Buffer.from(enc_dt, 'base64').toString()
  data = JSON.parse(data)
  var res_dt = await db_Delete('td_ghg_quest_cal', `client_id = ${client_id} AND scope = '${data.scope}' AND project_id = ${data.project_id} AND sl_no = ${data.sl_no} AND sec_id = ${data.sec_id} AND act_id = ${data.act_id}`)
  if(res_dt.suc > 0){
    var cal_quest_del = await db_Delete('td_ghg_quest', `client_id = ${client_id} AND scope = '${data.scope}' AND project_id = ${data.project_id} AND pro_sl_no = ${data.sl_no} AND end_flag = 'Y'`)
  }
  res.send(res_dt)
})

CalcUserRouter.post('/ghg_edit_cal_data_ajax', async (req, res) => {
  var req_data = req.body,
  client_id = req.session.user.client_id,
  user_name = req.session.user.user_name,
  dateTime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'), res_dt;
  if(req_data.flag > 0){
    if(req_data.cal_val.length > 0){
      var i = 0
      for(let dt of req_data.cal_val){
        var chk_dt = await db_Select('id', 'td_ghg_quest_cal', `project_id=${req_data.project_id} AND sl_no=${req_data.sl_no} AND quest_id=${req_data.quest_id} AND repo_period='${req_data.repo_period}' AND repo_month = '${req_data.repo_month}' AND repo_mode_label='${req_data.repo_mode_label[i]}'`)

        var table_name = 'td_ghg_quest_cal',
        fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `cal_val = ${dt}, emi_fact_val = ${req_data.emi_fact_val[i]}, co_val = ${req_data.co_val[i]}, modified_by = '${user_name}', modified_ct = '${dateTime}'` : `(client_id, scope, project_id, quest_id, sl_no, sec_id, act_id, emi_type_id, repo_period, repo_month, repo_mode_label, emi_type_unit_id, cal_val, emi_fact_val, co_val, created_by, created_dt)`,
        values = `(${client_id}, ${req_data.scope}, ${req_data.project_id}, ${req_data.quest_id}, ${req_data.sl_no}, ${req_data.sec_id}, ${req_data.act_id}, ${req_data.emi_type_id}, ${req_data.repo_period}, '${req_data.repo_month}', '${req_data.repo_mode_label[i]}', ${req_data.emi_type_unit_id}, ${dt}, ${req_data.emi_fact_val[i]}, ${req_data.co_val[i]}, '${user_name}', '${dateTime}')`,
        whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id=${chk_dt.msg[0].id}` : null,
        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
        res_dt = await db_Insert(table_name, fields, values, whr, flag)
        i++
      }
    }
    // console.log(req_data.url, 'URL');
    
    res.redirect(`/cal_proj_report_view?${req_data.url}`)
  }else{
    var data = new Buffer.from(req_data.enc_dt, 'base64').toString()
    data = JSON.parse(data)
    res.render("calculator_project/calTabModal", {cal_data: data})
  }
})

module.exports = {CalcUserRouter}