const { db_Select, db_Insert } = require("./MasterModule"),
    dateFormat = require("dateformat");

module.exports = {
    getSupportList: (id, user_type, client_id, user_id, status='P') => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.tkt_no, a.tkt_date, a.client_id, b.client_name, a.issue, c.user_name issued_by, (SELECT d.user_name FROM md_user d WHERE a.resolved_by=d.id) resolved_by, a.resolve_dt, a.remarks, a.tkt_status',
                table_name = 'td_support_log a, td_client b, md_user c',
                whr = `a.client_id=b.id AND a.issued_by=c.id AND a.tkt_status = '${status}' ${user_type != 'S' ? 
                `AND a.client_id = ${client_id} ${user_type != 'C' && user_type != 'A' ? 
                `AND a.issued_by = ${user_id}` : ''} ${id > 0 ? 
                    `AND a.id = ${id}` : ''}` : 
                    `${id > 0 ? `AND a.id = ${id}` : ''}`}`,
                order = `ORDER BY a.tkt_date`;
            var res_dt = await db_Select(select, table_name, whr, order)
            console.log(whr);
            resolve(res_dt)
        })
    },
    supportSave: (data, client_id, user_type, user_name, user_id) => {
        return new Promise(async (resolve, reject) => {
            var MaxId = await db_Select('IF(MAX(id) > 0, MAX(id)+1, 1) maxId', 'td_support_log', null, null)
            var tkt_no = MaxId.suc > 0 ? MaxId.msg[0].maxId : 0;
            tkt_no = 'C/' + tkt_no + '/' + client_id + '/' + dateFormat(new Date(), 'yyyymmdd')
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'td_support_log',
                fields = data.id > 0 ? `issue = '${data.issue}' ${user_type == 'S' ? `, resolved_by = '${user_id}', resolve_dt = '${datetime}', remarks = '${data.remarks}', tkt_status = '${data.tkt_status}'` : ''}, modified_by = '${user_name}', modified_dt = '${datetime}'`:
                `(tkt_no, tkt_date, client_id, issue, issued_by, tkt_status, created_by, created_dt)`,
                values = `('${tkt_no}', '${datetime}', '${client_id}', '${data.issue}', '${user_id}', 'P', '${user_name}', '${datetime}')`,
                whr = data.id > 0 ? `id = ${data.id}` : null,
                flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    }
}