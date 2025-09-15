const { SaveSubsData } = require('../modules/SubscModule');
const { getClientList } = require('../modules/UserModule');
// MODIFIED BY VIKASH //
const { db_Select, db_Insert, db_Routine } = require("../modules/MasterModule");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIP);
// END //

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

// SubsRouter.get('/subscription', async (req, res) => {
//     var client_id = req.session.user.client_id
//     var client_dtls = await getClientList(client_id)
//     // console.log(client_dtls);
//     var data = {
//         subs: client_dtls.suc > 0 && client_dtls.msg.length > 0 ? client_dtls.msg[0].plan_type : 'N',
//         subs_dt: client_dtls.suc > 0 && client_dtls.msg.length > 0 ? client_dtls.msg[0].diff_dt : 0,
//         header: "Subscription",
//     };
//     res.render('subscription/view', data)
// })

// MODIFIED BY VIKASH //
SubsRouter.get("/subscription", async (req, res) => {
    var chk_dt = await db_Select(
        "*",
        "stripe_subscriptions",
        `user_id = ${req.session.user.id}`,
        `order by created_at desc limit 1`,
    );
    if (chk_dt.msg.length <= 0) {
        var data = {
            header: "Subscription",
            email: req.session.user.user_id,
        };
        res.render("subscription/main", data);
    }
    else {
        var data = {
            header: "Subscription",
            subs: chk_dt.msg.length > 0 ? chk_dt.msg[0] : null,
        };
        res.render("subscription/view", data);
    }
});



SubsRouter.get('/subscription/main', async (req, res) => {

    var user_dt = await db_Select("stripe_customer_id", "md_user", `id=${req.session.user.id}`);
    var customer = null;
    if (user_dt.msg.length > 0 && user_dt.msg[0].stripe_customer_id) {
        customer = await stripe.customers.retrieve(user_dt.msg[0].stripe_customer_id);
    }
    else {
        customer = await stripe.customers.create({
            email: req.session.user.user_id,
            name: req.session.user.user_name,
            metadata: { userId: req.session.user.id },
        });
        await db_Insert("md_user", `stripe_customer_id = '${customer.id}'`, null, `id=${req.session.user.id}`, 1);
    }

    var data = {
        header: "Subscription",
        email: req.session.user.user_id,
        customer_id: customer?.id || customer?.stripe_customer_id
    };
    res.render('subscription/main', data)
})


SubsRouter.get('/subscription/video', async (req, res) => {
    var data = {
        header: "Subscription",
        email: req.session.user.user_id
    };
    res.render('subscription/video', data)
})


SubsRouter.get("/subscription/success", async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        const product = req.query.product;
        const month_yearly = req.query.myear;

        if (!sessionId) {
            return res.status(400).json({ error: "Missing session_id" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["subscription", "customer"],
        });

        const subscription = session.subscription;

        let user_id = req.session.user.id;

        var chk_dt = await db_Select(
            "*",
            "stripe_subscriptions",
            `user_id = ${user_id}`,
            `order by created_at desc limit 1`
        );

        if (chk_dt?.msg.length > 0) {
            await stripe.subscriptions.update(chk_dt?.msg[0]?.stripe_subscription_id, { cancel_at_period_end: false });
            await db_Insert('stripe_subscriptions', 'status="cancelled"', null, `user_id=${req.session.user.id}`, 1);
        }
        const purchaseDate = new Date(subscription?.start_date * 1000);
        const expireDate = new Date(purchaseDate);

        if (month_yearly === "Month") {
            expireDate.setMonth(expireDate.getMonth() + 1);
        } else if (month_yearly === "Yearly") {
            expireDate.setFullYear(expireDate.getFullYear() + 1);
        }

        const purchased = purchaseDate.toLocaleString("en-CA", { hour12: false }).replace(",", "");
        const expired = expireDate.toLocaleString("en-CA", { hour12: false }).replace(",", "");

        var table_name = 'stripe_subscriptions',
            fields = `(
        user_id,
        product_name,	
        month_yearly,
        purchase_date,
        expires_date,
        stripe_subscription_id, 
        stripe_customer_id,
        amount,
        currency, 
        status, 
        full_json
        )`,
            values = `('
         ${user_id}', 
        '${product}', 
        '${month_yearly}', 
        '${purchased}', 
        '${expired}', 
        '${subscription.id}', 
        '${session.customer.id}', 
        '${subscription.plan.amount / 100}', 
        '${subscription.currency}', 
        '${subscription.status}',  
        '${JSON.stringify(subscription)}'
        )`,
            whr = null,
            flag = 0;
        await db_Insert(table_name, fields, values, whr, flag);

        if (chk_dt?.msg.length > 0) {
            await db_Routine(
                `CALL UpdateSubscription('${user_id}','${new Date().toLocaleString("en-CA", { hour12: false }).replace(",", "")}','${chk_dt?.msg[0].product_name}','${chk_dt?.msg[0].month_yearly}')`
            );
        }

        res.redirect("/subscription");
    } catch (err) {
        console.error("Error in /subscription/success:", err);
        res.status(500).json({ error: err.message });
    }
});

SubsRouter.get("/subscription/cancel/:id/:sub_id", async (req, res) => {
    let id = req.params.id;
    let sub_id = req.params.sub_id
    try {

        await stripe.subscriptions.update(sub_id, { cancel_at_period_end: true });
        await db_Routine(
            `CALL CancelSubscription('${id}','${new Date().toLocaleString("en-CA", { hour12: false }).replace(",", "")}')`
        );
        req.session.message = {
            type: "success",
            message: "Subscription cancelled successfully"
        }
        res.redirect("/subscription");
    } catch (err) {
        console.error("Error in /subscription/cancel/:id/:sub_id:", err);
        req.session.message = {
            type: "danger",
            message: err.message
        }
        res.redirect("/subscription");
    }
});
// END //

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