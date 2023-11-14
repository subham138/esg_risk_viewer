const { getCalTypeList, getCalAct, getCalEmiType, saveCalType, saveCalAct, saveCalEmiType } = require('../modules/CalculatorModule');

const express = require('express'),
    CalculatorRouter = express.Router();

CalculatorRouter.get('/cal_type', async (req, res) => {
    var data = await getCalTypeList()
    var view_data = {
        data,
        header: 'Calculator Type'
    }
    res.render('calculator/type/view', view_data)
})

CalculatorRouter.get('/cal_type_edit', async (req, res) => {
    var dt = Buffer.from(req.query.data, "base64")
    dt = JSON.parse(dt);
    var id = dt.id;
    console.log(dt);
    var data = {suc:0,msg:[]}
    if(id > 0)
        data = await getCalTypeList(id)
    var view_data = {
        data: data.suc > 0 ? data.msg : [],
        header: "Calculator Type",
        sub_header: "Add/Edit Calculator Type",
        header_url: "/cal_type",
        id: id,
    }
    res.render('calculator/type/entry', view_data)
})

CalculatorRouter.post('/cal_type_edit', async (req, res) => {
    var data = req.body,
    user = req.session.user.user_name;
    var res_dt = await saveCalType(data, user)
    if(res_dt.suc > 0){
        req.session.message = {
            type: "success",
            message: "Saved successfully",
        };
        res.redirect("/cal_type");
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(data.id > 0 ? `/cal_type` : "/cal_type");
    }
})

CalculatorRouter.get('/cal_act', async (req, res) => {
    var data = await getCalAct()
    var view_data = {
        data,
        header: 'Calculator Activity'
    }
    res.render('calculator/activity/view', view_data)
})

CalculatorRouter.get('/cal_act_edit', async (req, res) => {
    var dt = Buffer.from(req.query.data, "base64")
    dt = JSON.parse(dt);
    var id = dt.id;
    var data = {suc:0,msg:[]},
    cal_type = await getCalTypeList();
    if(id > 0)
        data = await getCalAct(id)
    var view_data = {
        data: data.suc > 0 ? data.msg : [],
        cal_type: cal_type.suc > 0 ? cal_type.msg : [],
        header: "Calculator Activity",
        sub_header: "Add/Edit Calculator Activity",
        header_url: "/cal_act",
        id: id,
    }
    res.render('calculator/activity/entry', view_data)
})

CalculatorRouter.post('/cal_act_edit', async (req, res) => {
    var data = req.body,
    user = req.session.user.user_name;
    var res_dt = await saveCalAct(data, user)
    if(res_dt.suc > 0){
        req.session.message = {
            type: "success",
            message: "Saved successfully",
        };
        res.redirect("/cal_act");
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(data.id > 0 ? `/cal_act` : "/cal_act");
    }
})

CalculatorRouter.post('/get_cal_act_ajax', async (req, res) => {
    var type_id = req.query.type_id
    var res_dt = await getCalAct(0, type_id)
    res.send(res_dt)
})

CalculatorRouter.get('/cal_emi_type', async (req, res) => {
    var data = await getCalEmiType()
    var view_data = {
        data,
        header: 'Calculator Emission Type'
    }
    res.render('calculator/emission_type/view', view_data)
})

CalculatorRouter.get('/cal_emi_type_edit', async (req, res) => {
    var dt = Buffer.from(req.query.data, "base64")
    dt = JSON.parse(dt);
    var id = dt.id;
    var data = {suc:0,msg:[]},
    cal_type = await getCalTypeList(),
    act_type = {suc:0,msg:[]};
    if(id > 0){
        data = await getCalEmiType(id)
        act_type = await getCalAct(0, data.suc > 0 ? (data.msg.length > 0 ? data.msg[0].type_id : 0) : 0)
    }
    var view_data = {
        data: data.suc > 0 ? data.msg : [],
        cal_type: cal_type.suc > 0 ? cal_type.msg : [],
        act_type: act_type.suc > 0 ? act_type.msg : [],
        header: "Calculator Emission Type",
        sub_header: "Add/Edit Calculator Emission Type",
        header_url: "/cal_emi_type",
        id: id,
    }
    res.render('calculator/emission_type/entry', view_data)
})

CalculatorRouter.post('/cal_emi_type_edit', async (req, res) => {
    var data = req.body,
    user = req.session.user.user_name;
    var res_dt = await saveCalEmiType(data, user)
    if(res_dt.suc > 0){
        req.session.message = {
            type: "success",
            message: "Saved successfully",
        };
        res.redirect("/cal_emi_type");
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(data.id > 0 ? `/cal_emi_type` : "/cal_emi_type");
    }
})

module.exports = {CalculatorRouter}