const { db_Select, db_Insert } = require("./MasterModule");
const bcrypt = require('bcrypt'),
dateFormat = require("dateformat");

module.exports = {
    getUserList: (id=null, client_id, active_flag = null) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.user_name, a.user_id, b.client_name, a.user_type, a.active_flag',
            table_name = 'md_user a, td_client b',
            whr = `a.client_id=b.id AND a.user_type NOT IN('S', 'C') AND a.client_id = ${client_id} ${id > 0 ? `AND a.id = ${id}` : ''} ${active_flag && active_flag != 'A' ? `AND active_flag = '${active_flag}'` : ''}`,
            order = null;
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveUser: (data, user, client_id) => {
        return new Promise(async (resolve, reject) => {
            var pass = bcrypt.hashSync(data.password, 10),
                datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

            var table_name = 'md_user',
            fields = data.id > 0 ? `user_name = '${data.user_name}', user_type = '${data.user_type}', user_id = '${data.user_id}', password = '${pass}', active_flag = '${data.active_flag}', modified_by = '${user}', modified_dt = '${datetime}'`:
            `(client_id, user_name, user_type, user_id, password, active_flag, created_by, created_dt)`,
            values = `('${client_id}', '${data.user_name}', '${data.user_type}', '${data.user_id}', '${pass}', '${data.active_flag}', '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getClientList: (id=null) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.client_name, b.user_name, b.user_id, b.user_type',
            table_name = 'td_client a, md_user b',
            whr = `a.id=b.client_id AND b.user_type = 'C' ${id > 0 ? `AND a.id = ${id}` : ''}`,
            order = null;
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    }
}