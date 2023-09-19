const { getSectorList } = require('../modules/AdminModule');
const { db_Insert } = require('../modules/MasterModule');
const { getProjectList, saveProject, getLocationList } = require('../modules/ProjectModule');
const { getUserList } = require('../modules/UserModule');

const express = require('express'),
ProjectRouter = express.Router();

ProjectRouter.use((req, res, next) => {
    var user = req.session.user;
    if (user) {
        next();
    } else {
        res.redirect("/login");
    }
})

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
    console.log(data);
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

module.exports = {ProjectRouter}