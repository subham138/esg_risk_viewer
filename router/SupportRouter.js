const { getSupportList, supportSave } = require('../modules/SupportModule');
const { getClientList } = require('../modules/UserModule');

const express = require('express'),
    SupportRouter = express.Router(),
    dateFormat = require("dateformat");

SupportRouter.use((req, res, next) => {
    var user = req.session.user;
    if (user) {
        next();
    } else {
        res.redirect("/login");
    }
})

SupportRouter.get('/support', async (req, res) => {
    var client_id = req.session.user.client_id,
        userType = req.session.user.user_type,
        user_id = req.session.user.id;
    var supportList = await getSupportList(0, userType, client_id, user_id)
    // console.log(supportList);
    var data = {
        user_type: userType,
        supportList: supportList.suc > 0 ? supportList.msg : [],
        header: "Support Log",
        dateFormat,
    };
    res.render('support/view', data)
})

SupportRouter.get('/support_edit', async (req, res) => {
    var client_id = req.session.user.client_id,
        userType = req.session.user.user_type,
        user_id = req.session.user.id,
        user_name = req.session.user.user_name,
        id = req.query.id,
        client_dtls = await getClientList(client_id),
        support_msg = [];
    var supportList = []
    if(id > 0){
        supportList = await getSupportList(id, userType, client_id, user_id)
        support_msg = supportList.suc > 0 ? (supportList.msg_dt ? supportList.msg_dt : []) : []
        supportList = supportList.suc > 0 ? supportList.msg : [];
    }
    // console.log(supportList);
    var data = {
        client_name: id > 0 && userType == 'S' ? (supportList.length > 0 ? supportList[0].client_name : '') : (client_dtls.suc > 0 && client_dtls.msg.length > 0 ? client_dtls.msg[0].client_name : ''),
        user_name: id > 0 && userType == 'S' ? (supportList.length > 0 ? supportList[0].issued_by : '') : user_name,
        user_type: userType,
        user_id,
        supportList,
        support_msg,
        client_id,
        id,
        header: "Support Log",
        header_url: '/support',
        sub_header: "Support Log Edit",
        dateFormat
    };
    res.render('support/entry', data)
})

SupportRouter.post('/support_save', async (req, res) => {
    var data = req.body;
    var client_id = req.session.user.client_id,
        userType = req.session.user.user_type,
        user_id = req.session.user.id,
        user_name = req.session.user.user_name;
    var res_dt = await supportSave(data, client_id, userType, user_name, user_id)
    if (res_dt.suc > 0) {
        req.session.message = {
          type: "success",
          message: "Saved successfully",
        };
        res.redirect("/support");
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(data.id > 0 ? `/support_save?id=${data.id}` : "/support_save");
    }
})

SupportRouter.post('/getSupportList', async (req, res) => {
    var client_id = req.session.user.client_id,
        userType = req.session.user.user_type,
        user_id = req.session.user.id;
    var data = req.body
    var supportList = await getSupportList(0, userType, client_id, user_id, data.flag)
    res.send(supportList)
})

module.exports = {SupportRouter}