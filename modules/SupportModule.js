const { db_Select } = require("./MasterModule")

module.exports = {
    getSupportList: (id, user_type, client_id, user_id) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.*',
                table_name = 'td_support_log a',
                whr = `${user_type != 'S' ? `a.client_id = ${client_id} ${user_type != 'C' || user_type != 'A' ? `AND a.user_id = ${user_id}` : ''} ${id > 0 ? `AND a.id = ${id}` : ''}` : `${id > 0 ? `a.id = ${id}` : ''}`}`,
                order = `ORDER BY a.tkt_date`;
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    }
}