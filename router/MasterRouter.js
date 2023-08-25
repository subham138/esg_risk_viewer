const express = require('express'),
MasterRouter = express.Router();

const { getSectorList, getIndustriesList, getTopicCatgList, getTopicList, getBusiActList } = require('../modules/AdminModule');
const { db_Insert, db_Select, db_Check } = require('../modules/MasterModule');

MasterRouter.get('/sector', async (req, res) => {
    var data = await getSectorList()
    // console.log(data);
    res.render('master/sector/view', {data})
})

MasterRouter.get('/sec_edit', async (req, res) => {
    var id = req.query.id, data;
    if(id > 0){
        data = await getSectorList(id)
    }
    console.log(id);
    res.render('master/sector/add', {data, sec_id: id})
})

MasterRouter.post('/sec_save', async (req, res) => {
    var data = req.body
    var table_name = 'md_sector', 
    fields = data.id > 0 ? `sec_name = '${data.sec_name}'` : '(sec_name)', 
    values = `('${data.sec_name}')`, 
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0 ;
    var res_dt = await db_Insert(table_name, fields, values, whr, flag)
    if(res_dt.suc > 0){
        req.session.message = { type: 'success', message: 'Data saved successfully' };
        res.redirect('/sector')
    }else{
        req.session.message = { type: 'danger', message: 'Data not saved' };
        res.redirect(data.id > 0 ? `/sector?id=${data.id}` : '/sector') 
    }
})

MasterRouter.get('/industries', async (req, res) => {
    var data = await getIndustriesList()
    // console.log(data);
    res.render('master/industries/view', {data})
})

MasterRouter.get('/ind_edit', async (req, res) => {
    var id = req.query.id, ind_data,
    sec_data = await getSectorList();
    var topic_catg = await getTopicCatgList(), topic = {};
    for(let dt of topic_catg.msg){
        topic[dt.catg_name] = await getTopicList(0, dt.id)
    }
    if(id > 0){
        ind_data = await getIndustriesList(id)
    }
    res.render('master/industries/add', {ind_data, sec_data, ind_id: id, topic, topic_catg})
})

MasterRouter.post('/ind_save', async (req, res) => {
    var data = req.body
    var table_name = 'md_industries', 
    fields = data.id > 0 ? `sec_id = '${data.sec_id}', ind_name = '${data.ind_name}'` : '(sec_id, ind_name)', 
    values = `('${data.sec_id}', '${data.ind_name}')`, 
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0 ;
    if(data.top_id.length > 0){
        for(let dt of data.top_id){
            var chk_dt = db_Check('count(id) chk_id', 'td_indus_topic', `topic_id = ${dt} AND ind_id = ${ind_id}`)
        }
    }
    console.log(data);
    // var res_dt = await db_Insert(table_name, fields, values, whr, flag)
    // if(res_dt.suc > 0){
    //     req.session.message = { type: 'success', message: 'Data saved successfully' };
    //     res.redirect('/industries')
    // }else{
    //     req.session.message = { type: 'danger', message: 'Data not saved' };
    //     res.redirect(data.id > 0 ? `/industries?id=${data.id}` : '/industries') 
    // }
})

MasterRouter.get('/topic_catg', async (req, res) => {
    var data = await getTopicCatgList()
    // console.log(data);
    res.render('master/topic_catg/view', {data})
})

MasterRouter.get('/topic_catg_edit', async (req, res) => {
    var id = req.query.id, data;
    if(id > 0){
        data = await getTopicCatgList(id)
    }
    console.log(id);
    res.render('master/topic_catg/add', {data, id: id})
})

MasterRouter.post('/topic_catg_save', async (req, res) => {
    var data = req.body
    var table_name = 'md_topic_catg', 
    fields = data.id > 0 ? `catg_name = '${data.catg_name}'` : '(catg_name)', 
    values = `('${data.catg_name}')`, 
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0 ;
    var res_dt = await db_Insert(table_name, fields, values, whr, flag)
    if(res_dt.suc > 0){
        req.session.message = { type: 'success', message: 'Data saved successfully' };
        res.redirect('/topic_catg')
    }else{
        req.session.message = { type: 'danger', message: 'Data not saved' };
        res.redirect(data.id > 0 ? `/topic_catg?id=${data.id}` : '/topic_catg') 
    }
})

MasterRouter.get('/topic', async (req, res) => {
    var data = await getTopicList()
    // console.log(data);
    res.render('master/topic/view', {data})
})

MasterRouter.get('/topic_edit', async (req, res) => {
    var id = req.query.id, topic_data,
    catg_data = await getTopicCatgList();
    if(id > 0){
        topic_data = await getTopicList(id)
    }
    res.render('master/topic/add', {topic_data, catg_data, id: id})
})

MasterRouter.post('/topic_save', async (req, res) => {
    var data = req.body
    var table_name = 'md_topic', 
    fields = data.id > 0 ? `topic_catg_id = '${data.topic_catg_id}', topic_name = '${data.topic_name}'` : '(topic_catg_id, topic_name)', 
    values = `('${data.sec_id}', '${data.ind_name}')`, 
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0 ;
    var res_dt = await db_Insert(table_name, fields, values, whr, flag)
    if(res_dt.suc > 0){
        req.session.message = { type: 'success', message: 'Data saved successfully' };
        res.redirect('/topic')
    }else{
        req.session.message = { type: 'danger', message: 'Data not saved' };
        res.redirect(data.id > 0 ? `/topic_edit?id=${data.id}` : '/topic') 
    }
})

MasterRouter.get('/busi_act', async (req, res) => {
    var data = await getBusiActList()
    // console.log(data);
    res.render('master/busi_act/view', {data, header: 'Business Activities (NACE)'})
})

MasterRouter.get('/get_ind_list_ajax', async (req, res) => {
    var data = req.query
    var ind_data = await getIndustriesList(0, data.sec_id)
    res.send(ind_data)
})

MasterRouter.get('/busi_act_edit', async (req, res) => {
    var id = req.query.id,
    sec_data = await getSectorList(),
    ind_data = [], busi_data;
    if(id > 0){
        busi_data = await getBusiActList(id)
        ind_data = await getIndustriesList(0, busi_data.suc > 0 ? busi_data.msg[0].sec_id : 0)
    }
    var data = {
        sec_data,
        ind_data,
        busi_data,
        header: 'Business Activities (NACE)',
        sub_header: 'Add/Edit Business Activities (NACE)',
        header_url: '/busi_act',
        id: id
    }
    res.render('master/busi_act/add', data)
})

MasterRouter.post('/busi_act_save', async (req, res) => {
    var data = req.body
    var table_name = 'md_busi_act', 
    fields = data.id > 0 ? `sec_id = '${data.sec_id}', ind_id = '${data.ind_id}', busi_act_name = '${data.busi_act_name}'` : '(sec_id, ind_id, busi_act_name)', 
    values = `('${data.sec_id}', '${data.ind_id}', '${data.busi_act_name}')`, 
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0 ;
    var res_dt = await db_Insert(table_name, fields, values, whr, flag)
    if(res_dt.suc > 0){
        req.session.message = { type: 'success', message: 'Data saved successfully' };
        res.redirect('/busi_act')
    }else{
        req.session.message = { type: 'danger', message: 'Data not saved' };
        res.redirect(data.id > 0 ? `/busi_act_edit?id=${data.id}` : '/busi_act') 
    }
})

module.exports = {MasterRouter}