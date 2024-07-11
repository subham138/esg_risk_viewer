const { db_Select } = require('../modules/MasterModule');

const express = require('express'),
DashboardRouter = express.Router(),
dateFormat = require('dateformat');

DashboardRouter.use((req, res, next) => {
    var user = req.session.user;
    if (user) {
        next();
    } else {
        res.redirect("/login");
    }
})

DashboardRouter.get("/dashboard", async (req, res) => {
    var user = req.session.user, flag = false, daysLeft = 0, dash_proj_data = {}, suppDt={};
    // console.log(user);
    if(user.user_type != 'S'){
        var client_user_dt = await db_Select('DATEDIFF(plan_deactive_dt,plan_active_dt) AS diff_dt, id', 'td_client', `id=${user.client_id}`, null)
        flag = client_user_dt.suc > 0 && client_user_dt.msg.length > 0 ? (client_user_dt.msg[0].diff_dt <= 30 ? true : false) : false
        daysLeft = client_user_dt.suc > 0 && client_user_dt.msg.length > 0 ? client_user_dt.msg[0].diff_dt : 0
        if(user.user_type != 'C' && user.user_type != 'A'){
            var res_dt = await db_Select('*', 'v_tot_user_project', `user_id=${user.id} AND client_id=${user.client_id}`, null)
            dash_proj_data = res_dt.suc > 0 ? res_dt.msg[0] : {}
        }else{
            var res_dt = await db_Select('*', 'v_tot_project_done', `client_id=${user.client_id}`, null)
            dash_proj_data = res_dt.suc > 0 ? res_dt.msg[0] : {}
        }
        var supp_from = `(
            SELECT COUNT(id) tot_solved, 0 tot_pending FROM td_support_log WHERE client_id = ${user.client_id} ${user.user_type != 'C' && user.user_type != 'A' ? `AND issued_by = ${user.id}` : ''} AND tkt_status = 'S'
            UNION
            SELECT 0 tot_solved, COUNT(id) tot_pending FROM td_support_log WHERE client_id = ${user.client_id} ${user.user_type != 'C' && user.user_type != 'A' ? `AND issued_by = ${user.id}` : ''} AND tkt_status = 'P') a`
        var supp_res = await db_Select('SUM(a.tot_solved) tot_solved, SUM(a.tot_pending) tot_pending', supp_from, null, null)
        suppDt = supp_res.suc > 0 ? supp_res.msg[0] : {}
    }else{
        flag = false
    }
    var data = {
        user_type: user.user_type,
        last_login: user.login_dt > 0 ? dateFormat(new Date(user.login_dt), 'dd/mm/yyyy HH:MM:ss').toString() : dateFormat(new Date(), 'dd/mm/yyyy HH:MM:ss').toString(),
        flag,
        daysLeft,
        dash_proj_data,
        suppDt
    }
    res.render("pages/index", data);
});

module.exports = {DashboardRouter}