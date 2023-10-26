const express = require('express'),
    SupportRouter = express.Router();

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
        userType = req.session.user.user_type;
    var client_dtls = await getClientList(client_id)
    console.log(client_dtls);
    var data = {
        subs: client_dtls.suc > 0 && client_dtls.msg.length > 0 ? client_dtls.msg[0].plan_type : 'N',
        subs_dt: client_dtls.suc > 0 && client_dtls.msg.length > 0 ? client_dtls.msg[0].diff_dt : 0,
        header: "Subscription",
    };
    res.render('subscription/view', data)
})

module.exports = {SupportRouter}