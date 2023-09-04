const { db_Select } = require("./MasterModule")

module.exports = {
    getSusDiscList: (sec_id, ind_id, top_id) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.top_id, a.sl_no, a.metric, a.catg, a.unit, a.code',
            table_name = 'td_sus_dis_top_met a, md_sector b, md_industries c',
            whr = `a.sec_id=b.id AND a.ind_id=c.id AND b.id=c.sec_id ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ''} ${top_id > 0 ? `AND a.top_id = ${top_id}` : ''}`,
            order = 'ORDER BY a.top_id, a.sl_no';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    getActMetrialDtls: (sec_id, ind_id) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.sec_id, b.sec_name, a.ind_id, b.sec_name, a.sl_no, a.act_metric, a.catg, a.unit, a.code',
            table_name = 'td_act_metrics a, md_sector b, md_industries c',
            whr = `a.sec_id=b.id AND a.ind_id=c.id AND b.id=c.sec_id ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ''}`,
            order = 'ORDER BY a.sl_no';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    }
}