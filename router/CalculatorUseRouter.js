const CalcUserRouter = require('express').Router()
const { getCalQuestUserDt, getCalAct } = require('../modules/CalculatorModule');
const { SCOPE_LIST, YEAR_LIST, PROJECT_LIST } = require('../modules/MasterModule');
const { getProjectList } = require('../modules/ProjectModule');

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
  var res_dt = await getCalQuestUserDt(data.scope_id > 0 ? data.scope_id : 1)
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

module.exports = {CalcUserRouter}