const CalcUserRouter = require('express').Router()
const { SCOPE_LIST } = require('../modules/MasterModule');

CalcUserRouter.get('/cal_fetch_quest', async (req, res) => {
  var scope_list = SCOPE_LIST
    var data = {
        header: "Manage User",
      };
    res.render('calc_user/quest_entry', data)
})

module.exports = {CalcUserRouter}