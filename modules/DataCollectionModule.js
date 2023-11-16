const { db_Select } = require("./MasterModule")

module.exports = {
    getSusDiscList: (sec_id, ind_id, top_id) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.top_id, a.sl_no, a.ind_agn, a.metric, a.catg, a.unit, a.code, e.topic_name, a.words',
            table_name = 'td_sus_dis_top_met a, md_sector b, md_industries c, md_industries_topics d, md_topic e',
            whr = `a.sec_id=b.id AND a.ind_id=c.id AND b.id=c.sec_id AND a.top_id=d.id AND d.topic_id=e.id ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ''} ${top_id > 0 ? `AND a.top_id = ${top_id}` : ''}`,
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
    },
    getDynamicData: (id=null, sec_id = null, ind_id = null, topic_id = null) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.dt_year, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.top_id, e.topic_name, a.data_file_name',
            table_name = 'td_data_collection a, md_sector b, md_industries c, md_industries_topics d, md_topic e',
            whr = `a.sec_id=b.id AND a.ind_id=c.id AND a.top_id=d.id AND a.ind_id = d.ind_id AND d.topic_id=e.id ${id > 0 ? `AND a.id = ${id}` : ''} ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ''} ${topic_id > 0 ? `AND a.top_id = ${topic_id}` : ''}`,
            order = 'ORDER BY a.id';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    }
}