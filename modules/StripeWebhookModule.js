const { db_Select, db_Insert, db_Delete } = require("./MasterModule"),
    dateFormat = require("dateformat");
const stripe = require('stripe')(process.env.STRIP);

const manageProducts = (data, event) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (event === 'plan.created' || event === 'plan.updated') {
                const price_id = data.id
                const product_dtls = await db_Select('*', 'stripe_products', `stripe_product_id='${price_id}'`);
                if (product_dtls.suc > 0 && product_dtls.msg.length > 0) {
                    // Update existing product
                    const updateFields = `stripe_product_title='${data.name}', amount='${data.amount ? parseInt(data.amount) : 0}', interval='${data.interval ? data.interval : 'N/A'}', updated_by='system', updated_dt='${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}'`;
                    await db_Insert('stripe_products', updateFields, null, `stripe_product_id='${price_id}'`, 1);
                    resolve({ suc: 1, msg: 'Product updated successfully' });
                } else {
                    // Create new product
                    const table_name = 'stripe_products',
                        fields = `(stripe_plan_id, stripe_product_id, stripe_product_title, amount, interval, created_by, created_dt)`,
                        values = `('${data.product ? data.product : 'N/A'}', '${price_id}', '${data.nickname ? data.nickname : 'N/A'}', '${data.amount ? parseInt(data.amount) : 0}', '${data.interval ? data.interval : 'N/A'}', 'system', '${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}')`,
                        whr = null,
                        flag = 0;
                    await db_Insert(table_name, fields, values, whr, flag);
                    resolve({ suc: 1, msg: 'Product created successfully' });
                }
            } else if (event === 'plan.deleted') {
                const price_id = data.id
                await db_Delete('stripe_products', `stripe_product_id='${price_id}'`);
                resolve({ suc: 1, msg: 'Product deleted successfully' });
            } else {
                resolve({ suc: 0, msg: 'No action for this event' });
            }
        } catch (err) {
            console.log(err);

            reject({ suc: 0, msg: 'Error managing products', error: err });
        }
    })
}

const manageSubscription = (data, event) => {
    return new Promise(async (resolve, reject) => {
        try {
            let Response;
            // Handle the event
            const currDate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            switch (event) {
                case 'update':
                    var invoiceDt = await stripe.invoices.retrieve(data.latest_invoice);
                    try{
                        await saveTransaction(invoiceDt, 0, 'S')
                    }catch(err){
                        console.log('Error saving transaction for updated subscription invoice:', err);
                    }

                    const planDtls = await db_Select('id, plan_name', 'md_product', `stripe_pan_id='${data.plan.product}'`);
                    const plan_id = planDtls.suc > 0 && planDtls.msg.length > 0 ? planDtls.msg[0].id : 0,
                    prod_name = planDtls.suc > 0 && planDtls.msg.length > 0 ? planDtls.msg[0].plan_name : '';
                    const month_yearly = data.plan.interval;

                    const purchaseDate = new Date(data?.start_date * 1000);
                    const expireDate = new Date(purchaseDate);

                    if (month_yearly === "month") {
                        expireDate.setMonth(expireDate.getMonth() + 1);
                    } else if (month_yearly === "year") {
                        expireDate.setFullYear(expireDate.getFullYear() + 1);
                    }

                    const purchased = purchaseDate.toLocaleString("en-CA", { hour12: false }).replace(",", "");
                    const expired = expireDate.toLocaleString("en-CA", { hour12: false }).replace(",", "");

                    console.log(data.plan.amount, 'PLAN', data.plan);
                    
                    var chk_subs = await db_Select('id,user_id','stripe_subscriptions', `stripe_subscription_id='${data.id}' AND status!='canceled'`);
                    const user_id = chk_subs.suc > 0 && chk_subs.msg.length > 0 ? chk_subs.msg[0].user_id : 0;
                    if(chk_subs.suc > 0 && chk_subs.msg.length > 0){
                        await db_Insert('stripe_subscriptions', `status='canceled', updated_at='${currDate}'`, null, `stripe_subscription_id='${data.id}'`, 1);
                    }

                    var table_name = 'stripe_subscriptions',
                        fields = `(user_id, product_name, month_yearly, stripe_product_id, stripe_plan_id, purchase_date, expires_date, stripe_subscription_id, stripe_customer_id, amount, currency, status, full_json)`,
                        values = `(${user_id}, '${prod_name}', '${month_yearly}', '${data.plan.product}', '${data.plan.id}', '${purchased}', '${expired}', '${data.id}', '${data.customer}', '${data.plan.amount / 100}', '${data.currency}', '${data.status}', '${JSON.stringify(data)}')`,
                        whr = null,
                        flag = 0;
                    Response = await db_Insert(table_name, fields, values, whr, flag);

                    var table_name = 'md_user',
                        fields = `plan_is_active='Y',active_pan_id='${plan_id}',plan_start_dt='${purchased}',plan_end_dt='${expired}', modified_by='stripe-update-webhook', modified_dt='${currDate}'`,
                        values = null,
                        whr = `stripe_customer_id='${data.customer}'`,
                        flag = 1;
                    Response = await db_Insert(table_name, fields, values, whr, flag);

                    resolve(Response);
                    break;
                case 'cancel':
                    var chk_subs = await db_Select('id', 'stripe_subscriptions', `stripe_subscription_id='${data.id}' AND stripe_product_id='${data.plan.product}' AND stripe_plan_id='${data.plan.id}'`);

                    var canceled_at = data.canceled_at ? dateFormat(new Date(data.canceled_at * 1000), "yyyy-mm-dd HH:MM:ss") : currDate;

                    const cancel_comment = data.cancellation_details ? (data.cancellation_details.comment ? data.cancellation_details.comment : '') : '',
                        cancel_feedback = data.cancellation_details ? (data.cancellation_details.feedback ? data.cancellation_details.feedback : '') : '',
                        cancel_reason = data.cancellation_details ? (data.cancellation_details.reason ? data.cancellation_details.reason : '') : '';

                    if (chk_subs.suc > 0 && chk_subs.msg.length > 0) {
                        var subsId = chk_subs.msg[0].id;
                        Response = await db_Insert('stripe_subscriptions', `status='canceled', cancel_comment='${cancel_comment}', cancel_feedback = '${cancel_feedback}', cancel_reason = '${cancel_reason}', canceled_at = '${canceled_at}', canceled_json = '${JSON.stringify(data)}', updated_at='${currDate}'`, null, `id='${subsId}'`, 1);

                        var table_name = 'md_user',
                            fields = `plan_is_active='N',active_pan_id=null,plan_start_dt=null,plan_end_dt=null, modified_by='stripe-update-webhook', modified_dt='${currDate}'`,
                            values = null,
                            whr = `stripe_customer_id='${data.customer}'`,
                            flag = 1;
                        Response = await db_Insert(table_name, fields, values, whr, flag);
                        resolve(Response);
                    }else{
                        resolve({ suc: 0, msg: 'Subscription not found to cancel' });
                    }
                    break;
                default:
                    console.log(`Unhandled event type ${event}`);
                    resolve({ suc: 0, msg: `Unhandled event type ${event}` });
            }
            // console.log(stripeResponse);
        } catch (err) {
            console.log(err);
            reject({ suc: 0, msg: 'Error managing subscription', error: err });
        }
    })
}

const saveTransaction = (data, user_id, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            const curr_dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            const table_name = 'td_stripe_transaction',
                fields = `(entry_dt, invoice_id, subscription_id, due_amount, received_amount, total_paied, currency, stripe_customer_id, pay_status, customer_email, customer_name, ${status != 'S' ? `failed_code,failed_decline_code,failed_message,failed_type,` : 'hosted_invoice_url, invoice_pdf,'} full_json, created_by, created_dt)`,
                values = `('${curr_dt}', '${data.id}', '${data.parent.subscription_details ? data.parent.subscription_details.subscription : ""}', '${data.amount_due / 100}', '${data.amount_paid / 100}', '${data.total / 100}', '${data.currency}', '${data.customer}', '${status != 'S' ? 'failed' : data.status}', '${data.customer_email}', '${data.customer_name}', ${status != 'S' ? `'${data.last_payment_error ? data.last_payment_error.code : ""}','${data.last_payment_error ? data.last_payment_error.decline_code : ""}','${data.last_payment_error ? data.last_payment_error.message : ""}','${data.last_payment_error ? data.last_payment_error.type : ""}',` : `'${data.hosted_invoice_url}','${data.invoice_pdf}',`} '${JSON.stringify(data)}', 'system', '${curr_dt}')`,
                whr = null,
                flag = 0;
            const saveDt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(saveDt);
        } catch (err) {
            console.log(err);
            reject({ suc: 0, msg: 'Error saving transaction', error: err });
        }
    })
}

module.exports = {
    manageProducts,
    manageSubscription,
    saveTransaction
}