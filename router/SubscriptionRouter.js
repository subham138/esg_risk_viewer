const { SaveSubsData } = require('../modules/SubscModule');
const { getClientList } = require('../modules/UserModule');

const express = require('express'),
    SubsRouter = express.Router();

SubsRouter.use((req, res, next) => {
    var user = req.session.user;
    if (user) {
        next();
    } else {
        res.redirect("/login");
    }
})

SubsRouter.get('/subscription', async (req, res) => {
    var client_id = req.session.user.client_id
    var client_dtls = await getClientList(client_id)
    console.log(client_dtls);
    var data = {
        subs: client_dtls.suc > 0 && client_dtls.msg.length > 0 ? client_dtls.msg[0].plan_type : 'N',
        subs_dt: client_dtls.suc > 0 && client_dtls.msg.length > 0 ? client_dtls.msg[0].diff_dt : 0,
        header: "Subscription",
    };
    res.render('subscription/view', data)
})

SubsRouter.get('/subs_plan', async (req, res) => {
    var data = req.query,
    user_id = req.session.user.user_id,
    user_name = req.session.user.user_name,
    client_id = req.session.user.client_id;
    var res_dt = await SaveSubsData(user_name, client_id, data.id);
    if(res_dt.suc > 0){
        req.session.message = {
            type: "success",
            message: "Your plan updated successfully",
        };
        res.redirect('/subscription')
    }else{
        req.session.message = {
            type: "warning",
            message: "Something went wrong. Please try again after some time.",
        };
        res.redirect('/subscription')
    }
})

module.exports = {SubsRouter}