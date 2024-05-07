const { db_Select, db_Insert, db_Delete } = require("./MasterModule");
const dateFormat = require("dateformat");

module.exports = {
    getProjectList: (id=null, client_id, user_id=null, flag = 'I') => {
        return new Promise(async (resolve, reject) => {
            if(user_id > 0){
                var select = 'b.id, b.project_name, b.sec_id, b.ind_id, b.last_access, b.last_accessed_by, b.business_act, b.bus_act_id, b.location_busi_act',
                    table_name = 'td_user_project a, td_project b',
                    whr = `a.project_id = b.id AND b.repo_flag = '${flag}' AND a.user_id = ${user_id} AND a.client_id = '${client_id}' ${id > 0 ? `AND b.id = ${id}` : ''}`,
                    order = 'ORDER BY b.id DESC';
                var res_dt = await db_Select(select, table_name, whr, order)
                resolve(res_dt)
            }else{
                var select = 'a.id, a.project_name, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.last_access, a.last_accessed_by, a.business_act, a.bus_act_id, a.location_busi_act',
                    table_name = 'td_project a, md_sector b, md_industries c',
                    whr = `a.sec_id=b.id AND a.repo_flag=b.repo_flag AND a.ind_id=c.id AND a.repo_flag=c.repo_flag AND a.sec_id=c.sec_id AND a.repo_flag = '${flag}' AND a.client_id = '${client_id}' ${id > 0 ? `AND a.id = ${id}` : ''}`,
                    order = 'ORDER BY a.id DESC';
                var res_dt = await db_Select(select, table_name, whr, order)
                if(id > 0){
                    if(res_dt.suc > 0 && res_dt.msg.length > 0){
                        var select = 'a.id, a.client_id, a.project_id, a.user_id, b.user_type, b.user_name',
                            table_name = 'td_user_project a, md_user b',
                            whr = `a.user_id=b.id AND a.client_id = '${client_id}' AND a.project_id = '${res_dt.msg[0].id}'`,
                            order = null;
                        var user_dt = await db_Select(select, table_name, whr, order)
                        user_dt.suc > 0 && user_dt.msg.length > 0 ? res_dt.msg[0]['user_list'] = user_dt.msg : ''
                        resolve(res_dt)
                    }else{
                        resolve(res_dt)
                    }
                }else{
                    resolve(res_dt)
                }
            }
        })
    },
    saveProject: (data, client_id, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

            var table_name = 'td_project',
                fields = data.id > 0 ? `project_name = '${data.project_name}', modified_by = '${user}', modified_dt = '${datetime}'` : `(repo_flag, client_id, project_name, created_by, created_dt)`,
                values = `('${data.flag}', '${client_id}', '${data.project_name}', '${user}', '${datetime}')`,
                whr = data.id > 0 ? `id = ${data.id}` : null,
                flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)

            var project_id = data.id > 0 ? data.id : (res_dt.suc > 0 ? res_dt.lastId.insertId : 0)

            if(Array.isArray(data.user_id)){
                for(let dt of data.user_id){
                    var chk_dt = await db_Select('id', 'td_user_project', `client_id = ${client_id} AND project_id = '${project_id}' AND user_id = '${dt}'`, null)

                    var table_name = 'td_user_project',
                        fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `project_id = '${project_id}', user_id = '${dt}', modified_by = '${user}', modified_dt = '${datetime}'` : 
                        `(client_id, project_id, user_id, created_by, created_dt)`,
                        values = `('${client_id}', '${project_id}', '${dt}', '${user}', '${datetime}')`,
                        whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
                        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
                    res_dt = await db_Insert(table_name, fields, values, whr, flag)
                }
            }else{
                var chk_dt = await db_Select('id', 'td_user_project', `client_id = ${client_id} AND project_id = '${project_id}' AND user_id = '${data.user_id}'`, null)
                
                var table_name = 'td_user_project',
                    fields = chk_dt.suc > 0 && chk_dt.msg.length ? `project_id = '${project_id}', user_id = '${data.user_id}', modified_by = '${user}', modified_dt = '${datetime}'` : 
                    `(client_id, project_id, user_id, created_by, created_dt)`,
                    values = `('${client_id}', '${project_id}', '${data.user_id}', '${user}', '${datetime}')`,
                    whr = chk_dt.suc > 0 && chk_dt.msg.length ? `id = ${chk_dt.msg[0].id}` : null,
                    flag = chk_dt.suc > 0 && chk_dt.msg.length ? 1 : 0;
                res_dt = await db_Insert(table_name, fields, values, whr, flag)
            }
            resolve(res_dt)
        })
    },
    getLocationList: (id = null) => {
        return new Promise(async (resolve, reject) => {
            var select = 'id, location_name', 
            table_name = 'md_location', 
            whr = id > 0 ? `id = ${id}` : null, 
            order = 'ORDER BY location_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveProjectArticle: (data, user_id, client_id, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            
            var select = 'id', 
                table_name = 'td_project_work', 
                whr = `repo_flag = '${data.flag}' AND sec_id = ${data.sec_id} AND ind_id = ${data.ind_id} AND top_id = ${data.top_id} AND project_id = ${data.project_id} AND article_code = "${data.topicTilte}"`, 
                order = null;
            var chk_dt = await db_Select(select, table_name, whr, order)

            var table_name = 'td_project_work',
                fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 
                `article = '${data.txtEditorVal}', modified_by = '${user}', modified_dt = '${datetime}'` : 
                `(repo_flag, sec_id, ind_id, top_id, project_id, article_code, article, user_id, created_by, created_dt)`,
                values = `('${data.flag}', '${data.sec_id}', '${data.ind_id}', '${data.top_id}', '${data.project_id}', "${data.topicTilte}", '${data.txtEditorVal}', '${user_id}', '${user}', '${datetime}')`,
                whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
                flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getSavedProjectWork: (sec_id, ind_id, top_id, project_id, flag) => {
        return new Promise(async (resolve, reject) => {
            var select = '*', 
                table_name = 'td_project_work', 
                whr = `repo_flag = '${flag}' AND sec_id = ${sec_id} AND ind_id = ${ind_id} ${top_id > 0 ? `AND top_id = ${top_id}` : ''} AND project_id = ${project_id}`, 
                order = null;
            var chk_dt = await db_Select(select, table_name, whr, order)
            resolve(chk_dt)
        })
    },
    getGhgEmiList: (client_id, id = 0, proj_id = 0) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.client_id, a.scope, a.entry_dt, a.user_id, a.sl_no, a.sec_id, b.type_name, a.act_id, c.act_name, a.emi_type_id, d.emi_name, a.repo_period, a.repo_month, a.emi_type_unit_id, a.cal_val, a.emi_fact_val, a.co_val',
                table_name = 'td_ghg_emission a, md_cal_type b, md_cal_act c, md_cal_emi_type d', 
                whr = `a.sec_id=b.id AND a.act_id=c.id AND a.emi_type_id=d.id AND client_id = ${client_id} ${proj_id > 0 ? `AND project_id=${proj_id}` : ''} ${id > 0 ? `AND id=${id}` : ''}`, 
                order = null;
            var chk_dt = await db_Select(select, table_name, whr, order)
            resolve(chk_dt)
        })
    },
    saveGhgEmi: (data, user_id, user, client_id) => {
        return new Promise(async (resolve, reject) => {
            var res_dt = '', nowDate = dateFormat(new Date(), "yyyy-mm-dd"), datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            data.req_data = JSON.parse(data.req_data);
            if(Array.isArray(data.req_data)){
                for (let dt of data.req_data){
                    var select = "id",
                      table_name = "td_ghg_emission",
                      whr = `client_id = ${client_id} AND scope = '${data.scope}' AND project_id = ${data.proj_id} AND sl_no = ${data.sl_no} AND sec_id = ${data.sec_id} AND act_id = ${data.act_id} AND emi_type_id = ${data.emi_type_id} AND repo_period = ${data.repo_period} AND repo_month = '${dt.month}'`,
                      order = null;
                    var chk_dt = await db_Select(select, table_name, whr, order)
                    var table_name = "td_ghg_emission",
                        fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `emi_type_unit_id = '${dt.emi_type_unit_id}', cal_val = '${dt.cal_val}', emi_fact_val = '${dt.emi_fact_val}', co_val = '${dt.co_val}', modified_by = '${user}', modified_dt = '${datetime}'` : 
                        '(client_id, scope, project_id, entry_dt, user_id, sl_no, sec_id, act_id, emi_type_id, repo_period, repo_month, emi_type_unit_id, cal_val, emi_fact_val, co_val, created_by, created_dt)',
                        values = `(${client_id}, '${data.scope}', '${data.proj_id}', '${nowDate}', '${user_id}', '${data.sl_no}', '${data.sec_id}', '${data.act_id}', '${data.emi_type_id}', '${data.repo_period}', '${dt.month}', ${dt.emi_type_unit_id > 0 ? dt.emi_type_unit_id : 0}, ${dt.cal_val > 0 ? dt.cal_val : 0}, ${dt.emi_fact_val > 0 ? dt.emi_fact_val : 0}, ${dt.co_val > 0 ? dt.co_val : 0}, '${user}', '${datetime}')`,
                        whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
                        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
                    res_dt = await db_Insert(table_name, fields, values, whr, flag)
                }
            }
            resolve(res_dt)
        })
    },
    getActiveTopicList: (ind_id, flag) => {
        return new Promise(async (resolve, reject) => {
            var select = `a.id, a.ind_id, a.topic_id, b.topic_name, b.topic_catg_id catg_id, c.catg_name, a.topic_flag`,
            table_name = 'md_industries_topics a, md_topic b, md_topic_catg c',
            whr = `a.topic_id=b.id AND a.repo_flag=b.repo_flag AND b.topic_catg_id=c.id AND a.repo_flag=c.repo_flag AND a.topic_flag = 'Y' AND a.ind_id = '${ind_id}' AND a.repo_flag = '${flag}'`,
            order = 'ORDER BY a.topic_id';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveCheckedProjectFlag: (data, user, active_flag) => {
        return new Promise(async (resolve, reject) => {
            var res_dt = '', datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var chk_dt = await db_Select('id', 'td_project_checkd_topic', `repo_flag = '${data.flag}' AND project_id = '${data.project_id}' AND topic_id = '${data.top_id}'`, null);
            // await db_Delete('td_project_checkd_topic', `repo_flag='${data.flag}' AND project_id = ${data.project_id}`)
            var table_name = "td_project_checkd_topic",
                fields = chk_dt.suc > 0 ? (chk_dt.msg.length > 0 ? `check_flag = '${active_flag}'` : '(repo_flag, project_id, topic_id, check_flag, created_by, created_dt)') : '(repo_flag, project_id, topic_id, check_flag, created_by, created_dt)',
                values = chk_dt.suc > 0 ? (chk_dt.msg.length > 0 ? null : `('${data.flag}', '${data.project_id}', '${data.top_id}', '${active_flag}', '${user}', '${datetime}')`) : `('${data.flag}', '${data.project_id}', '${data.top_id}', '${active_flag}', '${user}', '${datetime}')`,
                whr = chk_dt.suc > 0 ? (chk_dt.msg.length > 0 ? `repo_flag = '${data.flag}' AND project_id = '${data.project_id}' AND topic_id = '${data.top_id}'` : null) : null,
                flag = chk_dt.suc > 0 ? (chk_dt.msg.length > 0 ? 1 : 0) : 0;
            res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getCheckedProjectTopList: (id, flag, proj_id) => {
        return new Promise(async (resolve, reject) => {
            var select = `*`,
            table_name = 'td_project_checkd_topic',
            whr = id > 0 ? `id=${id}` : `repo_flag='${flag}' AND project_id='${proj_id}'`,
            order = null;
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    }
}