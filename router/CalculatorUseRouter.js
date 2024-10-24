const CalcUserRouter = require('express').Router()
const { getCalQuestUserDt } = require('../modules/CalculatorModule');
const { SCOPE_LIST } = require('../modules/MasterModule');

CalcUserRouter.get('/cal_fetch_quest', async (req, res) => {
  var scope_list = SCOPE_LIST
    var data = {
        header: "Manage User",
        scope_list
      };
    res.render('calc_user/quest_entry', data)
})

CalcUserRouter.post('/get_question_list_by_scope_user_ajax', async (req, res) => {
  var data = req.body
  var res_dt = await getCalQuestUserDt(data.scope_id > 0 ? data.scope_id : 1)
  res.send(res_dt)
})

module.exports = {CalcUserRouter}