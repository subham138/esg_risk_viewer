const { db_Select } = require('../modules/MasterModule');

const express = require('express'),
DashboardRouter = express.Router();

DashboardRouter.use((req, res, next) => {
    var user = req.session.user;
    if (user) {
        next();
    } else {
        res.redirect("/login");
    }
})

DashboardRouter.get("/dashboard", async (req, res) => {
    var user = req.session.user, flag = false, daysLeft = 0;
    if(user.user_type != 'S'){
        var client_user_dt = await db_Select('DATEDIFF(plan_deactive_dt,plan_active_dt) AS diff_dt, id', 'td_client', `id=${user.client_id}`, null)
        flag = client_user_dt.suc > 0 && client_user_dt.msg.length > 0 ? (client_user_dt.msg[0].diff_dt <= 30 ? true : false) : false
        daysLeft = client_user_dt.suc > 0 && client_user_dt.msg.length > 0 ? client_user_dt.msg[0].diff_dt : 0
    }else{
        flag = false
    }
    var data = {
        flag,
        daysLeft
    }
    res.render("pages/index", data);
});

module.exports = {DashboardRouter}