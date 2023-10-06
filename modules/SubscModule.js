const { db_Select, db_Insert } = require("./MasterModule");
const bcrypt = require('bcrypt'),
dateFormat = require("dateformat");

module.exports = {
    SaveSubsData: (user, client_id, plan_id) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
            currdt = new Date(), deactiveDt = '';
            switch (plan_id) {
                case 'B':
                    deactiveDt = dateFormat(new Date(currdt.setMonth(currdt.getMonth()+3)), "yyyy-mm-dd HH:MM:ss")
                    break;
                case 'S':
                    deactiveDt = dateFormat(new Date(currdt.setMonth(currdt.getMonth()+6)), "yyyy-mm-dd HH:MM:ss")
                    break;
                case 'P':
                    deactiveDt = dateFormat(new Date(currdt.setMonth(currdt.getMonth()+12)), "yyyy-mm-dd HH:MM:ss")
                    break;
                default:
                    break;
            }

            var table_name = 'td_client', 
                fields = `plan_type = '${plan_id}', pay_flag = 'Y', plan_active_dt = '${datetime}', plan_deactive_dt = '${deactiveDt}', modified_by = '${user}', modified_dt = '${datetime}'`, 
                values = null, 
                whr = `id = ${client_id}`,
                flag = 1;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    }
}