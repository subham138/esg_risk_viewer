const CalcUserRouter = require('express').Router()

CalcUserRouter.get('/cal_fetch_quest', async (req, res) => {
    var data = {
        header: "Manage User",
      };
    res.render('calc_user/quest_entry', data)
})

module.exports = {CalcUserRouter}