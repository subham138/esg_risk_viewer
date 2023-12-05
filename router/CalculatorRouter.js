const { getCalTypeList, getCalAct, getCalEmiType, saveCalType, saveCalAct, saveCalEmiType, getUnitList, saveUnit, getCalEmiVal, saveCalEmiVal } = require('../modules/CalculatorModule');
const { db_Delete } = require('../modules/MasterModule');

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

CalculatorRouter.get('/cal_type_del', async (req, res) => {
    var id = req.query.id
    if (id > 0) {
        var res_dt = await db_Delete('md_cal_type', `id = ${id}`);
        req.session.message = { type: "danger", message: "Data deleted successfully" };
    }else{
        req.session.message = { type: "warning", message: "Data not deleted" };
    }
    res.redirect(`/cal_type`);
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

CalculatorRouter.get('/cal_act_del', async (req, res) => {
    var id = req.query.id
    if (id > 0) {
        var res_dt = await db_Delete('md_cal_act', `id = ${id}`);
        req.session.message = { type: "danger", message: "Data deleted successfully" };
    }else{
        req.session.message = { type: "warning", message: "Data not deleted" };
    }
    res.redirect(`/cal_act`);
})

CalculatorRouter.get('/cal_emi_type', async (req, res) => {
    var data = await getCalEmiType()
    var view_data = {
        data,
        header: 'Calculator Emission Type'
    }
    res.render('calculator/emission_type/view', view_data)
})

CalculatorRouter.post('/get_cal_emi_type_ajax', async (req, res) => {
    var type_id = req.query.type_id,
    act_id = req.query.act_id;
    var res_dt = await getCalEmiType(0, type_id, act_id)
    res.send(res_dt)
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

CalculatorRouter.get('/cal_emi_type_del', async (req, res) => {
    var id = req.query.id
    if (id > 0) {
        var res_dt = await db_Delete('md_cal_emi_type', `id = ${id}`);
        req.session.message = { type: "danger", message: "Data deleted successfully" };
    }else{
        req.session.message = { type: "warning", message: "Data not deleted" };
    }
    res.redirect(`/cal_emi_type`);
})

CalculatorRouter.get('/unit', async (req, res) => {
    var data = await getUnitList()
    var view_data = {
        data,
        header: 'Unit Master'
    }
    res.render('calculator/unit/view', view_data)
})

CalculatorRouter.get('/unit_edit', async (req, res) => {
    var dt = Buffer.from(req.query.data, "base64")
    dt = JSON.parse(dt);
    var id = dt.id;
    var data = {suc:0,msg:[]}
    if(id > 0)
        data = await getUnitList(id)
    var view_data = {
        data: data.suc > 0 ? data.msg : [],
        header: "Unit Master",
        sub_header: "Add/Edit Unit Master",
        header_url: "/unit",
        id: id,
    }
    res.render('calculator/unit/entry', view_data)
})

CalculatorRouter.post('/unit_edit', async (req, res) => {
    var data = req.body,
    user = req.session.user.user_name;
    var res_dt = await saveUnit(data, user)
    if(res_dt.suc > 0){
        req.session.message = {
            type: "success",
            message: "Saved successfully",
        };
        res.redirect("/unit");
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(data.id > 0 ? `/unit` : "/unit");
    }
})

CalculatorRouter.get('/unit_del', async (req, res) => {
    var id = req.query.id
    if (id > 0) {
        var res_dt = await db_Delete('md_unit', `id = ${id}`);
        req.session.message = { type: "danger", message: "Data deleted successfully" };
    }else{
        req.session.message = { type: "warning", message: "Data not deleted" };
    }
    res.redirect(`/unit`);
})

CalculatorRouter.get('/cal_emi_val', async (req, res) => {
    var data = await getCalEmiVal(0, 0, 0, 0, 0, 'Y')
    var view_data = {
        data,
        header: 'Calculator Emission Value'
    }
    res.render('calculator/emission_val/view', view_data)
})

CalculatorRouter.get('/cal_emi_val_edit', async (req, res) => {
    var dt = Buffer.from(req.query.data, "base64"),
        type_list = await getCalTypeList(), 
        act_list = {suc:0,msg:[]}, 
        emi_type = {suc:0,msg:[]}, 
        unit_list= await getUnitList();
    dt = JSON.parse(dt);
    var type_id = dt.type_id,
        act_id = dt.act_id,
        emi_type_id = dt.emi_type_id,
        period = dt.period;
    var data = {suc:0,msg:[]}
    if (type_id > 0 && act_id > 0 && emi_type_id > 0){
        data = await getCalEmiVal(0, type_id, act_id, emi_type_id);
        act_list = await getCalAct(0, type_id)
        emi_type = await getCalEmiType(0, type_id, act_id)
    }
    var year_list=[], currDate = new Date();
    // console.log(parseInt(currDate.getFullYear()));
    for(let i = 0; i<=6; i++){
        // console.log(i, 'Year');
        year_list.push(parseInt(currDate.getFullYear()) - i)
    }
    var view_data = {
        data: data.suc > 0 ? data.msg : [],
        type_list: type_list.suc > 0 ? type_list.msg : [],
        act_list: act_list.suc > 0 ? act_list.msg : [],
        emi_type: emi_type.suc > 0 ? emi_type.msg : [],
        unit_list: unit_list.suc > 0 ? unit_list.msg : [],
        header: "Calculator Emission Value",
        sub_header: "Add/Edit Calculator Emission Value",
        header_url: "/cal_emi_val",
        type_id,
        act_id,
        emi_type_id,
        year_list,
        period
    }
    res.render('calculator/emission_val/entry', view_data)
})

CalculatorRouter.post('/cal_emi_val_edit', async (req, res) => {
    var data = req.body,
    user = req.session.user.user_name;
    var res_dt = await saveCalEmiVal(data, user);
    if(res_dt.suc > 0){
        req.session.message = {
            type: "success",
            message: "Saved successfully",
        };
        res.redirect("/cal_emi_val");
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(data.id > 0 ? `/cal_emi_val` : "/cal_emi_val");
    }
})

CalculatorRouter.get('/cal_emi_val_del', async (req, res) => {
    var id = req.query.id
    if (id > 0) {
        var res_dt = await db_Delete('md_cal_emi_val', `type_id = ${data.type_id} AND act_id = ${data.act_id} AND emi_type_id = ${data.emi_type_id} AND repo_period = ${data.period}`);
        req.session.message = { type: "danger", message: "Data deleted successfully" };
    }else{
        req.session.message = { type: "warning", message: "Data not deleted" };
    }
    res.redirect(`/cal_emi_type`);
})

module.exports = {CalculatorRouter}