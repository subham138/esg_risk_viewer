const { db_Select } = require("./MasterModule")

const getSectorList = (id = null) => {
    return new Promise(async (resolve, reject) => {
        var select = 'id, sec_name', 
        table_name = 'md_sector', 
        whr = id > 0 ? `id = ${id}` : null, 
        order = null;
        var res_dt = await db_Select(select, table_name, whr, order)
        resolve(res_dt)
    })
}

const getIndustriesList = (id = null, sec_id = null) => {
    return new Promise(async (resolve, reject) => {
        var select = 'a.id, a.ind_name, a.sec_id, b.sec_name',
        table_name = 'md_industries a, md_sector b',
        whr = id > 0 ? `a.id = ${id}` : `a.sec_id=b.id ${sec_id > 0 ? `AND a.sec_id = '${sec_id}'` : ''}`, 
        order = null;
        var res_dt = await db_Select(select, table_name, whr, order)
        resolve(res_dt)
    })
}

const getTopicCatgList = (id = null) => {
    return new Promise(async (resolve, reject) => {
        var select = 'id, catg_name',
        table_name = 'md_topic_catg',
        whr = id > 0 ? `id = ${id}` : null, 
        order = null;
        var res_dt = await db_Select(select, table_name, whr, order)
        resolve(res_dt)
    })
}

const getTopicList = (id = null, catg_id = null) => {
    return new Promise(async (resolve, reject) => {
        var select = 'a.id, a.topic_name, a.topic_catg_id, b.catg_name topic_catg',
        table_name = 'md_topic a, md_topic_catg b',
        whr = id > 0 ? `a.topic_catg_id=b.id AND a.id = ${id}` : `a.topic_catg_id=b.id ${catg_id > 0 ? `AND a.topic_catg_id = '${catg_id}'` : ''}`, 
        order = null;
        var res_dt = await db_Select(select, table_name, whr, order)
        resolve(res_dt)
    })
}

const getBusiActList = (id = null) => {
    return new Promise(async (resolve, reject) => {
        var select = 'a.id, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.busi_act_name',
        table_name = 'md_busi_act a, md_sector b, md_industries c',
        whr = id > 0 ? `a.sec_id=b.id AND a.ind_id=c.id AND b.id=c.sec_id AND a.id = ${id}` : `a.sec_id=b.id AND a.ind_id=c.id AND b.id=c.sec_id`, 
        order = null;
        var res_dt = await db_Select(select, table_name, whr, order)
        resolve(res_dt)
    })
}

module.exports = {getSectorList, getIndustriesList, getTopicCatgList, getTopicList, getBusiActList}