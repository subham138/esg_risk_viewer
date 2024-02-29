const { db_Select, db_Insert } = require("./MasterModule"),
    dateFormat = require("dateformat");

module.exports = {
    getSupportList: (id, user_type, client_id, user_id, status='P') => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.tkt_no, a.tkt_date, a.client_id, b.client_name, a.issue_title, a.issue, c.user_name issued_by, (SELECT d.user_name FROM md_user d WHERE a.resolved_by=d.id) resolved_by, a.resolve_dt, a.remarks, a.tkt_status',
                table_name = 'td_support_log a, td_client b, md_user c',
                whr = id > 0 ? `a.client_id=b.id AND a.issued_by=c.id AND a.id = ${id}` : `a.client_id=b.id AND a.issued_by=c.id AND a.tkt_status = '${status}' ${user_type != 'S' ? 
                `AND a.client_id = ${client_id} ${user_type != 'C' && user_type != 'A' ? 
                `AND a.issued_by = ${user_id}` : ''} ${id > 0 ? 
                    `AND a.id = ${id}` : ''}` : 
                    `${id > 0 ? `AND a.id = ${id}` : ''}`}`,
                order = `ORDER BY a.tkt_date`;
            var res_dt = await db_Select(select, table_name, whr, order)

            if(id > 0){
                var select = 'id, log_id, log_dt, log_entry_user_type, log_entry_by, log_dtls',
                    table_name = 'td_support_log_msg',
                    whr = `log_id = ${id}`,
                    order = `ORDER BY log_dt`;
                    var res_msg_dt = await db_Select(select, table_name, whr, order)
                    console.log(res_msg_dt);
                res_dt.suc > 0 ? (res_dt['msg_dt'] = res_msg_dt.suc > 0 ? res_msg_dt.msg : []) : ''
            }
            // console.log(res_dt);
            // console.log(whr);
            resolve(res_dt)
        })
    },
    supportSave: (data, client_id, user_type, user_name, user_id) => {
        return new Promise(async (resolve, reject) => {
            var MaxId, tkt_no;
            if(data.id == 0){
                var MaxId = await db_Select('IF(MAX(id) > 0, MAX(id)+1, 1) maxId', 'td_support_log', null, null)
                var tkt_no = MaxId.suc > 0 ? MaxId.msg[0].maxId : 0;
                tkt_no = 'C/' + tkt_no + '/' + client_id + '/' + dateFormat(new Date(), 'yyyymmdd')
            }
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'td_support_log',
                fields = data.id > 0 ? `issue_title= '${data.issue_title}', issue = '${data.issue}' ${user_type == 'S' ? `, resolved_by = '${user_id}', resolve_dt = '${datetime}', remarks = '${data.remarks}', tkt_status = '${data.tkt_status}'` : `, tkt_status = 'P'`}, modified_by = '${user_name}', modified_dt = '${datetime}'`:
                `(tkt_no, tkt_date, client_id, issue_title, issue, issued_by, tkt_status, created_by, created_dt)`,
                values = `('${tkt_no}', '${datetime}', '${client_id}', '${data.issue_title}', '${data.issue}', '${user_id}', 'P', '${user_name}', '${datetime}')`,
                whr = data.id > 0 ? `id = ${data.id}` : null,
                flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)

            var log_id = data.id > 0 ? data.id : (res_dt.suc > 0 ? res_dt.lastId.insertId : 0)

            if(log_id > 0){
                var table_name = 'td_support_log_msg',
                fields = data.msg_id > 0 ? `log_entry_by = '${user_name}', log_dtls = '${user_type == 'S' ? data.remarks : data.issue}', modified_by = '${user_name}', modified_dt = '${datetime}'`:
                `(log_id, log_dt, log_entry_user_type, log_entry_by, log_dtls, created_by, created_dt)`,
                values = `('${log_id}', '${datetime}', '${user_type == 'S' ? 'A' : 'U'}', '${user_name}', '${user_type == 'S' ? data.remarks : data.issue}', '${user_name}', '${datetime}')`,
                whr = data.msg_id > 0 ? `id = ${data.msg_id}` : null,
                flag = data.msg_id > 0 ? 1 : 0;
                var res_msg_dt = await db_Insert(table_name, fields, values, whr, flag)
            }
            resolve(res_dt)
        })
    }
}