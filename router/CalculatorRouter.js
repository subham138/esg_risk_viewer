const { getCalTypeList, getCalAct, getCalEmiType } = require('../modules/CalculatorModule');

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
    var id = Buffer.from(req.query.id, "base64")
    id = JSON.parse(id);
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
    res.render('calculator/type/edit', view_data)
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
    var id = Buffer.from(req.query.id, "base64")
    id = JSON.parse(id);
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
    res.render('calculator/activity/edit', view_data)
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
    var id = Buffer.from(req.query.id, "base64")
    id = JSON.parse(id);
    var data = {suc:0,msg:[]},
    cal_type = await getCalTypeList(),
    act_type = {suc:0,msg:[]};
    if(id > 0){
        data = await getCalAct(id)
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
    res.render('calculator/emission_type/edit', view_data)
})

module.exports = {CalculatorRouter}