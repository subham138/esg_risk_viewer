const FBRouter = require('express').Router(),
{db_Insert, INPUT_TYPE_LIST, SCOPE_LIST, db_Select, db_Delete} = require('../modules/MasterModule'),
dateFormat = require("dateformat");

FBRouter.get('/form_builder', async (req, res) => {
    var data = await db_Select('DISTINCT scope_id', 'md_cal_form_builder', null, 'ORDER BY scope_id asc')
    var scope_list = SCOPE_LIST
    res.render('form_builder/view', {header: "Calculator Form Builder", scope_dt: data, scope_list})
})

FBRouter.get('/form_builder_edit', async (req, res) => {
    var scope_dt = SCOPE_LIST, data = req.query, qr_dt = {}, q_header = '';
    if(data.scope > 0){
        var resDt = await db_Select('*', 'md_cal_form_builder', `scope_id=${data.scope}`, 'ORDER BY id asc')
        if(resDt.suc > 0){
            var headerFilterDt = resDt.msg.filter(dt => dt.header_flag != 'N')
            var questFilterData = resDt.msg.filter(dt => dt.header_flag != 'Y')
            qr_dt = questFilterData
            // console.log(headerFilterDt);
            q_header = headerFilterDt[0].input_label
            for(let dt of questFilterData){
                if(dt.input_type != 'I'){
                    var opDt = await db_Select('id, builder_id, option_name', 'md_cal_form_builder_option', `builder_id=${dt.id}`, 'ORDER BY id asc')
                    dt['options'] = opDt.suc > 0 ? opDt.msg : []
                }
            }
        }
    }
    console.log(qr_dt);
    
    res.render('form_builder/entry', {scope: scope_dt, qr_dt, q_header, scope_id: data.scope})
})

FBRouter.post('/form_builder_post', async (req, res) => {
    var data = req.body,
    user_name = req.session.user.user_name,
    datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    resDt = {};
    
    if(data.cards.length > 0){
        var scopeDt = await db_Select('count(*) tot_row', 'md_cal_form_builder', `scope_id = ${data.scope_id}`, null)
        if(scopeDt.suc > 0){
            if(scopeDt.msg[0].tot_row > 0){
                await db_Delete('md_cal_form_builder', `scope_id = ${data.scope_id}`)
                await db_Delete('md_cal_form_builder_option', `scope_id = ${data.scope_id}`)
            }
        }
        var table_name = 'md_cal_form_builder',
        fields = `(scope_id, input_label, header_flag, created_by, created_dt)`,
        values = `(${data.scope_id}, '${data[`header`].split("'").join("\\'")}', 'Y', '${user_name}', '${datetime}')`,
        whr= null,
        flag = 0;
        resDt = await db_Insert(table_name, fields, values, whr, flag)
        for(let id of data.cards){
            var table_name = 'md_cal_form_builder',
            fields = `(scope_id, input_type, input_label, sequence, is_parent, parent_id, created_by, created_dt)`,
            values = `(${data.scope_id}, '${INPUT_TYPE_LIST[data[`option_${id}`]]}', '${data[`q_${id}`].split("'").join("\\'")}', '${data[`s_${id}`]}', '${data[`p_c_${id}`] > 0 ? 'N': 'Y'}', '${data[`p_c_${id}`] > 0 ? data[`p_c_${id}`] : 0}', '${user_name}', '${datetime}')`,
            whr= null,
            flag = 0;
            resDt = await db_Insert(table_name, fields, values, whr, flag)
            var builder_id = resDt.suc > 0 ? resDt.lastId.insertId : 0
            if(INPUT_TYPE_LIST[data[`option_${id}`]] != 'I' && builder_id > 0){
                for(let opt of data[`q_s_${id}`]){
                    var table_name = 'md_cal_form_builder_option',
                    fields = `(scope_id, builder_id, option_name, created_by, created_dt)`,
                    values = `(${data.scope_id}, ${builder_id}, '${opt}', '${user_name}', '${datetime}')`,
                    whr= null,
                    flag = 0;
                    await db_Insert(table_name, fields, values, whr, flag)
                }
            }
        }
    }
    res.send(resDt)
})

module.exports = {FBRouter}