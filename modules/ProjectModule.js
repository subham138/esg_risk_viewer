const { db_Select, db_Insert } = require("./MasterModule");
const dateFormat = require("dateformat");

module.exports = {
    getProjectList: (id=null, client_id, user_id=null) => {
        return new Promise(async (resolve, reject) => {
            if(user_id > 0){
                var select = 'b.id, b.project_name, b.last_access, b.last_accessed_by',
                    table_name = 'td_user_project a, td_project b',
                    whr = `a.project_id = b.id AND a.user_id = ${user_id} AND a.client_id = '${client_id}' ${id > 0 ? `AND b.id = ${id}` : ''}`,
                    order = 'ORDER BY b.id DESC';
                var res_dt = await db_Select(select, table_name, whr, order)
                resolve(res_dt)
            }else{
                var select = 'a.id, a.project_name, a.last_access, a.last_accessed_by',
                    table_name = 'td_project a',
                    whr = `a.client_id = '${client_id}' ${id > 0 ? `AND a.id = ${id}` : ''}`,
                    order = 'ORDER BY a.id DESC';
                var res_dt = await db_Select(select, table_name, whr, order)
                if(id > 0){
                    if(res_dt.suc > 0 && res_dt.msg.length > 0){
                        var select = 'a.id, a.client_id, a.project_id, a.user_id, b.user_name',
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
                fields = data.id > 0 ? `project_name = '${data.project_name}', modified_by = '${user}', modified_dt = '${datetime}'` : `(client_id, project_name, created_by, created_dt)`,
                values = `('${client_id}', '${data.project_name}', '${user}', '${datetime}')`,
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
                var chk_dt = await db_Select('id', 'td_user_project', `client_id = ${client_id} AND project_id = '${project_id}' AND user_id = '${dt}'`, null)
                
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
                whr = `sec_id = ${data.sec_id} AND ind_id = ${data.ind_id} AND top_id = ${data.top_id} AND project_id = ${data.project_id} AND article_code = '${data.topicTilte}'`, 
                order = null;
            var chk_dt = await db_Select(select, table_name, whr, order)

            var table_name = 'td_project_work',
                fields = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 
                `article = '${data.txtEditorVal}', modified_by = '${user}', modified_dt = '${datetime}'` : 
                `(sec_id, ind_id, top_id, project_id, article_code, article, user_id, created_by, created_dt)`,
                values = `('${data.sec_id}', '${data.ind_id}', '${data.top_id}', '${data.project_id}', '${data.topicTilte}', '${data.txtEditorVal}', '${user_id}', '${user}', '${datetime}')`,
                whr = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? `id = ${chk_dt.msg[0].id}` : null,
                flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getSavedProjectWork: (sec_id, ind_id, top_id, project_id) => {
        return new Promise(async (resolve, reject) => {
            var select = '*', 
                table_name = 'td_project_work', 
                whr = `sec_id = ${sec_id} AND ind_id = ${ind_id} AND top_id = ${top_id} AND project_id = ${project_id}`, 
                order = null;
            var chk_dt = await db_Select(select, table_name, whr, order)
            resolve(chk_dt)
        })
    }
}