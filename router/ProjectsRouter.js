const { getSectorList, getIndustriesList, getBusiActList } = require('../modules/AdminModule');
const { getCalTypeList, getCalUnitList } = require('../modules/CalculatorModule');
const { getDynamicData, getSusDiscList, getActMetrialDtls } = require('../modules/DataCollectionModule');
const { db_Insert, db_Delete } = require('../modules/MasterModule');
const { getProjectList, saveProject, getLocationList, saveProjectArticle, getSavedProjectWork } = require('../modules/ProjectModule');
const { getUserList } = require('../modules/UserModule');
const dateFormat = require("dateformat");

const express = require('express'),
ProjectRouter = express.Router(),
puppeteer = require('puppeteer'),
fs = require('fs'),
path = require('path');

// ProjectRouter.use((req, res, next) => {
//     var user = req.session.user;
//     if (user) {
//         next();
//     } else {
//         res.redirect("/login");
//     }
// })

ProjectRouter.get('/my_project', async (req, res) => {
    // var req_data = req.query
    var user_type = req.session.user.user_type,
        user_id = req.session.user.user_id;

    var project_data = await getProjectList(0, req.session.user.client_id, user_type != 'A' && user_type != 'C' && user_type != 'S' ? user_id : 0)
    var data = {
        user_type,
        project_data,
        header: "Project List",
    }
    res.render('projects/view', data)
})

ProjectRouter.get('/my_project_add', async (req, res) => {
    var id = req.query.id, project_data = [];
    var user_list = await getUserList(0, req.session.user.client_id)
    if(id > 0) {
        project_data = await getProjectList(id, req.session.user.client_id, 0)
    }
    console.log(project_data);
    var data = {
        user_list,
        id,
        project_data,
        header: "Project List",
        sub_header: "Project Add/Edit",
        header_url: "/my_project",
    };
    res.render("projects/add", data);
})

ProjectRouter.post('/my_project_save', async (req, res) => {
    var data = req.body
    var res_dt = await saveProject(data, req.session.user.client_id, req.session.user.user_name)
    req.session.message = {
        type: res_dt.suc > 0 ? "success" : "danger",
        message: res_dt.msg,
    };
    res.redirect('/my_project')
})

ProjectRouter.post('/delete_my_project', async (req, res) => {
    var data = req.body
    var res_dt = await db_Delete('td_user_project', `id=${data.id}`)
    res.send(res_dt)
})

ProjectRouter.get('/proj_work', async (req, res) => {
    var loc_list = await getLocationList(),
        sec_data = await getSectorList(),
        ind_data = [],
        act_list = [];
        var project_data = await getProjectList(req.query.id, req.session.user.client_id, 0)
    var data = {
        id:0,
        proj_id: req.query.id,
        proj_name: project_data.suc > 0 && project_data.msg.length > 0 ? project_data.msg[0].project_name : '',
        project_data: project_data.suc > 0 && project_data.msg.length > 0 ? project_data.msg[0] : false,
        loc_list,
        sec_data,
        ind_data,
        act_list,
        header: "Project Work",
        sub_header: "Project Add/Edit",
        header_url: "/my_project",
    }
    res.render('project_work/add', data)
})

ProjectRouter.post('/save_proj_work', async (req, res) => {
    var data = req.body,
        busi_data = await getBusiActList(0, data.sec_id, data.ind_id), busi_name = [],
        location_data = await getLocationList(), location_name = [],
        user_id = req.session.user.user_id,
        user_name = req.session.user.user_name,
        datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

    if(Array.isArray(data.bus_id)){
        for(let dt of data.bus_id){
            var indx = busi_data.suc > 0 && busi_data.msg.length > 0 ? busi_data.msg.findIndex(idt => idt.id == dt) : -1
            if(indx >= 0){
                busi_name.push(busi_data.msg[indx])
            }
        }
        busi_name = [...busi_name.map(dt=> dt.busi_act_name)]
        busi_name = busi_name.join(',')
        // console.log(busi_name);
    }else{
        var indx = busi_data.suc > 0 && busi_data.msg.length > 0 ? busi_data.msg.findIndex(idt => idt.id == data.bus_id) : -1
        if(indx >= 0){
            busi_name.push(busi_data.msg[indx])
        }
        busi_name = busi_name[0].busi_act_name
    }

    if(Array.isArray(data.location_id)){
        for(let dt of data.location_id){
            var indx = location_data.suc > 0 && location_data.msg.length > 0 ? location_data.msg.findIndex(idt => idt.id == dt) : -1
            if(indx >= 0){
                location_name.push(location_data.msg[indx])
            }
        }
        location_name = [...location_name.map(dt=> dt.location_name)]
        location_name = location_name.join(',')
    }else{
        var indx = location_data.suc > 0 && location_data.msg.length > 0 ? location_data.msg.findIndex(idt => idt.id == data.location_id) : -1
        if(indx >= 0){
            location_name.push(location_data.msg[indx])
        }
        location_name = location_name[0].location_name
    }
    var table_name = 'td_project', 
        fields = `last_access = '${datetime}', last_accessed_by = '${user_name}', sec_id = '${data.sec_id}', ind_id = '${data.ind_id}', business_act = "${busi_name}", location_busi_act = "${location_name}", modified_by = "${user_name}", modified_dt = "${datetime}"`, 
        values = null, 
        whr = `id = ${data.proj_id}`, 
        flag = 1;
    var res_dt = await db_Insert(table_name, fields, values, whr, flag)
    if (res_dt.suc > 0) {
        req.session.message = {
          type: "success",
          message: "Data saved successfully",
        };
        res.redirect(`/proj_work_view?dt=${Buffer.from(JSON.stringify({proj_id: data.proj_id, sec_id: data.sec_id, ind_id: data.ind_id}), "utf8").toString('base64')}`);
    } else {
        req.session.message = { type: "danger", message: "Data not saved" };
        res.redirect(`/proj_work?id=${data.proj_id}`);
    }
})

ProjectRouter.get('/proj_work_view', async (req, res) => {
    var enc_data = req.query.dt,
        data = Buffer.from(enc_data, "base64");
    data = JSON.parse(data)
    var sec_data = await getSectorList(data.sec_id),
        ind_data = await getIndustriesList(data.ind_id),
        project_data = await getProjectList(data.proj_id, req.session.user.client_id);
    // console.log(project_data);

    project_data = project_data.suc > 0 && project_data.msg.length > 0 ? project_data.msg[0] : null

    // console.log(ind_data);

    var res_data = {
        sec_name: sec_data.suc > 0 && sec_data.msg.length > 0 ? sec_data.msg[0] : null,
        ind_name: ind_data.suc > 0 && ind_data.msg.length > 0 ? ind_data.msg[0] : null,
        busi_name: project_data ? project_data.business_act : '',
        location_name: project_data ? project_data.location_busi_act : '',
        proj_id: data.proj_id,
        proj_name: project_data ? project_data.project_name : '',
        user_type: req.session.user.user_type,
        header: "Project Work",
        sub_header: "Project Add/Edit",
        header_url: "/my_project"
    }
    res.render("project_work/add_view", res_data);
})

ProjectRouter.get('/project_report_view', async (req, res) => {
    var enc_data = req.query.enc_data, data_set = {};
    var data = Buffer.from(enc_data, "base64")
    data = JSON.parse(data);
    var resDt = await getDynamicData(0, data.sec_id, data.ind_id, data.top_id);
    var susDistList = await getSusDiscList(data.sec_id, data.ind_id)
    var metric = await getActMetrialDtls(data.sec_id, data.ind_id)
    var editorVal = await getSavedProjectWork(data.sec_id, data.ind_id, data.top_id, data.proj_id)
    var topName = resDt.suc > 0 ? (resDt.msg.length > 0 ? resDt.msg[0].topic_name : '') : ''
    var allDynamicData = await getDynamicData(0, data.sec_id, data.ind_id, 0);
    var type_list = await getCalTypeList(), act_list = {suc:0,msg:[]}, 
    emi_type = {suc:0,msg:[]};
    var year_list=[], currDate = new Date();
    console.log(parseInt(currDate.getFullYear()));
    for(let i = 0; i<=6; i++){
        console.log(i, 'Year');
        year_list.push(parseInt(currDate.getFullYear()) - i)
    }
    allDynamicData = allDynamicData.suc > 0 ? allDynamicData.msg : ''
    // console.log(resDt);
    if (resDt.suc > 0 && resDt.msg.length > 0) {
        if(resDt.msg.length == 1){
            if (resDt.msg[0].data_file_name) {
                resDt = fs.readFileSync(path.join('dynamic_data_set', resDt.msg[0].data_file_name), 'utf-8')
                resDt = JSON.parse(resDt)
            }
        }else{
            for(let dt of resDt.msg){
                if(dt.data_file_name != ''){
                    var dynData = fs.readFileSync(path.join('dynamic_data_set', dt.data_file_name), 'utf-8')
                    data_set[dt.top_id] = JSON.parse(dynData)
                }
            }
        }
    }
    var res_data = {
        top_id: data.top_id, 
        topName,
        sec_id: data.sec_id,
        ind_id: data.ind_id,
        project_id: data.proj_id,
        projName: data.proj_name,
        repo_type: data.repo_type,
        resDt,
        susDistList,
        metric,
        user_type: req.session.user.user_type,
        editorData: editorVal.suc > 0 && editorVal.msg.length > 0 ? editorVal.msg : [],
        data_set,
        allDynamicData,
        type_list: type_list.suc > 0 ? type_list.msg : [],
        act_list: act_list.suc > 0 ? act_list.msg : [],
        emi_type: emi_type.suc > 0 ? emi_type.msg : [],
        year_list,
        header: "Project Work",
        sub_header: "Project View",
        header_url: "/my_project",
    };
    res.render("project_work/report_view", res_data);
    // res.send(res_data)
})

ProjectRouter.post('/get_cal_unit_list_ajax', async (req, res) => {
    var data = req.body
    var res_dt = await getCalUnitList(data.type_id, data.act_id, data.emi_type_id)
    res.send(res_dt)
})

ProjectRouter.post('/download_pdf', async (req, res) => {
    var data = req.body
    const browser = await puppeteer.launch({
        headless: 'new'
    });
    
    // Open a new page
    const page = await browser.newPage();

    // Set the content of the page with your HTML
    const htmlContent = data.pdfDiv;

    await page.setContent(htmlContent);

    // Generate a PDF file
    const pdfBuffer = await page.pdf({format: 'A4' });
    // var pdfBlob = new Blob([pdfBuffer])

    // Close the browser
    await browser.close();

    // console.log(pdfBlob);

    // Send the PDF as a download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
    res.send(pdfBuffer);
})

ProjectRouter.post('/save_editor_data', async (req, res) => {
    var data = req.body
    var res_dt = await saveProjectArticle(data, req.session.user.id, req.session.user.client_id, req.session.user.user_name)
    res.send(res_dt)
})

ProjectRouter.get('/other_report_view', async (req, res) => {
    var enc_data = req.query.enc_data,
        data = Buffer.from(enc_data, "base64");
    data = JSON.parse(data)
    var res_data = {
        project_id: data.proj_id,
        proj_name: data.proj_name,
        repo_type: data.repo_type,
        header: "Project Work",
        sub_header: "Project View",
        header_url: "/my_project",
    };
    res.render("project_work/other_report_view", res_data);
})

ProjectRouter.get('/test', async (req, res) => {
    res.render("project_work/test");
})

module.exports = {ProjectRouter}