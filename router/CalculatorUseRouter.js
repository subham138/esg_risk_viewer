const CalcUserRouter = require('express').Router(),
{ getCalQuestUserDt, getCalAct } = require('../modules/CalculatorModule'),
{ SCOPE_LIST, YEAR_LIST, PROJECT_LIST, db_Insert, db_Select } = require('../modules/MasterModule'),
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
    console.log(yearList, currYear, yearList.includes(currYear));
      
    res.render('calc_user/quest_entry', data)
})

CalcUserRouter.post('/get_question_list_by_scope_user_ajax', async (req, res) => {
  var data = req.body
  var res_dt = await getCalQuestUserDt(data.scope_id > 0 ? data.scope_id : 1, data.proj_id, req.session.user.client_id)
  res.send(res_dt)
})

CalcUserRouter.get('/cal_proj_report_view', async (req, res) => {
  var enc_data = req.query.enc_data,
    data_set = {};
  var data = Buffer.from(enc_data, "base64");
  data = JSON.parse(data);

  var project_data = await getProjectList(
    data.proj_id,
    req.session.user.client_id,
    0,
    data.flag,
    req.session.user.platform_mode
  );

  var scope_list = SCOPE_LIST,
  cal_act = await getCalAct(0, 0),
  currDate = new Date(),
  yearList = YEAR_LIST;
  var currYear = currDate.getFullYear()
  yearList.includes(currYear) ? '' : yearList.push(currYear)

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
      new Buffer.from(data.flag).toString("base64")
    )}`,
    flag: data.flag,
    cal_lang_flag: req.session.user.cal_lang_flag,
    flag_name: PROJECT_LIST[data.flag],
    scope_list,
    cal_act: cal_act.suc > 0 ? cal_act.msg : [],
    year_list: yearList
  };
  res.render("calculator_project/report_view", res_data)
})

CalcUserRouter.post('/cal_quest_save', async (req, res) => {
  var enc_dt = req.body.enc_dt, quest_ans = req.body.quest_ans, dateTime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'), currDate = dateFormat(new Date(), 'yyyy-mm-dd'), user = req.session.user;
  var data = new Buffer.from(enc_dt, 'base64').toString()
  data = JSON.parse(data)

  var chk_dt = await db_Select('id', 'td_ghg_quest', `client_id = ${user.client_id} AND project_id = ${data.proj_id} AND quest_id = ${data.quest_id} AND scope = ${data.scope_id}`)

  var table_name = 'td_ghg_quest',
  fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `quest_ans = '${quest_ans}', modified_by = '${user.user_id}', modified_dt = '${dateTime}'` : '(client_id, scope, project_id, entry_dt, quest_id, quest_type, quest_seq, quest_ans, created_by, created_dt)',
  values = `(${user.client_id}, '${data.scope_id}', ${data.proj_id}, '${currDate}', ${data.quest_id}, '${data.quest_type}', '${data.quest_seq}', '${quest_ans}', '${user.user_id}', '${dateTime}')`,
  whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
  flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag)
  res.send(res_dt)
})

CalcUserRouter.post('/get_cal_save_dt_ajax', async (req, res) => {
  var data = req.body, user = req.session.user;
  var res_dt = await db_Select('*', 'td_ghg_quest', `client_id=${user.client_id} AND scope_id=${data.scope_id} AND project_id=${data.proj_id}`)
})

module.exports = {CalcUserRouter}