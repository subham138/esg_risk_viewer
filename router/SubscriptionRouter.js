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
    var data = {
        header: "Subscription",
    };
    res.render('subscription/view', data)
})

module.exports = {SubsRouter}