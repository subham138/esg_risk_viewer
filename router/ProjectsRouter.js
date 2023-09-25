const { getSectorList, getIndustriesList, getBusiActList } = require('../modules/AdminModule');
const { getDynamicData, getSusDiscList, getActMetrialDtls } = require('../modules/DataCollectionModule');
const { db_Insert } = require('../modules/MasterModule');
const { getProjectList, saveProject, getLocationList } = require('../modules/ProjectModule');
const { getUserList } = require('../modules/UserModule');

const express = require('express'),
ProjectRouter = express.Router(),
puppeteer = require('puppeteer');

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
    var project_data = await getProjectList(0, req.session.user.client_id, 0)
    var data = {
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

ProjectRouter.get('/proj_work', async (req, res) => {
    var loc_list = await getLocationList(),
        sec_data = await getSectorList(),
        ind_data = [],
        act_list = [];
    var data = {
        id:0,
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

ProjectRouter.post('/proj_work_view', async (req, res) => {
    var data = req.body
    var sec_data = await getSectorList(data.sec_id),
        ind_data = await getIndustriesList(data.ind_id)
        busi_data = await getBusiActList(0, data.sec_id, data.ind_id), busi_name = [],
        location_data = await getLocationList(), location_name = [];
    if(Array.isArray(data.bus_id)){
        for(let dt of data.bus_id){
            var indx = busi_data.suc > 0 && busi_data.msg.length > 0 ? busi_data.msg.findIndex(idt => idt.id == dt) : -1
            if(indx >= 0){
                busi_name.push(busi_data.msg[indx])
            }
        }
    }else{
        var indx = busi_data.suc > 0 && busi_data.msg.length > 0 ? busi_data.msg.findIndex(idt => idt.id == data.bus_id) : -1
        if(indx >= 0){
            busi_name.push(busi_data.msg[indx])
        }
    }

    if(Array.isArray(data.location_id)){
        for(let dt of data.location_id){
            var indx = location_data.suc > 0 && location_data.msg.length > 0 ? location_data.msg.findIndex(idt => idt.id == dt) : -1
            if(indx >= 0){
                location_name.push(location_data.msg[indx])
            }
        }
    }else{
        var indx = location_data.suc > 0 && location_data.msg.length > 0 ? location_data.msg.findIndex(idt => idt.id == data.location_id) : -1
        if(indx >= 0){
            location_name.push(location_data.msg[indx])
        }
    }

    // console.log(ind_data);

    var res_data = {
        sec_name: sec_data.suc > 0 && sec_data.msg.length > 0 ? sec_data.msg[0] : null,
        ind_name: ind_data.suc > 0 && ind_data.msg.length > 0 ? ind_data.msg[0] : null,
        busi_name,
        location_name,
        header: "Project Work",
        sub_header: "Project Add/Edit",
        header_url: "/my_project",
    }
    res.render("project_work/add_view", res_data);
    
    // res.send(res_data)
    // var data = {
    //     id:0,
    //     loc_list,
    //     sec_data,
    //     ind_data,
    //     act_list,
    //     header: "Project Work",
    //     sub_header: "Project Add/Edit",
    //     header_url: "/my_project",
    // }
    // res.render('project_work/add', data)
})

ProjectRouter.get('/project_report_view', async (req, res) => {
    var data = req.query
    var resDt = await getDynamicData(0, data.sec_id, data.ind_id, data.top_id);
    var susDistList = await getSusDiscList(data.sec_id, data.ind_id)
    var metric = await getActMetrialDtls(data.sec_id, data.ind_id)
    if (resDt.suc > 0 && resDt.msg.length > 0) {
      if (resDt.msg[0].data_file_name) {
        resDt = require(`../dynamic_data_set/${resDt.msg[0].data_file_name}`);
      }
    }
    var res_data = {
        top_id: data.top_id,
      resDt,
      susDistList,
      metric,
      header: "Project Work",
      sub_header: "Project Add/Edit",
      header_url: "/my_project",
    };
    res.render("project_work/report_view", res_data);
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
    const pdfBuffer = await page.pdf({ path: 'output.pdf', format: 'A4' });

    // Close the browser
    await browser.close();

    // Send the PDF as a download
    res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
})

module.exports = {ProjectRouter}