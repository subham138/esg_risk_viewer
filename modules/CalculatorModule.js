const {db_Select, db_Insert} = require("./MasterModule")
const dateFormat = require("dateformat");
module.exports = {
    getUnitList: (id = 0) => {
        return new Promise(async (resolve, reject) => {
            var select = 'id, unit_name', 
            table_name = 'md_unit',
            whr = id > 0 ? `id = ${id}` : null,
            order = 'ORDER BY unit_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveUnit: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'md_unit',
            fields = data.id > 0 ? `unit_name = '${data.unit_name}', modified_by = '${user}', modified_dt = '${datetime}'` : 
            '(unit_name, created_by, created_dt)',
            values = `('${data.unit_name}', '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getCalTypeList: (id = 0) => {
        return new Promise(async (resolve, reject) => {
            var select = 'id, type_name, type', 
            table_name = 'md_cal_type',
            whr = id > 0 ? `id = ${id}` : null,
            order = 'ORDER BY type_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveCalType: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'md_cal_type',
            fields = data.id > 0 ? `type_name = '${data.type_name}', type = '${data.type}', modified_by = '${user}', modified_dt = '${datetime}'` : 
            '(type_name, type, created_by, created_dt)',
            values = `('${data.type_name}', '${data.type}', '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getCalAct: (id = 0, type_id = 0) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.type_id, a.act_name, b.type_name',
            table_name = 'md_cal_act a, md_cal_type b',
            whr = `a.type_id=b.id ${id > 0 ? `AND a.id = ${id}` : ''} ${type_id > 0 ? `AND a.type_id = ${type_id}` : ''}`,
            order = 'ORDER BY a.act_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveCalAct: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'md_cal_act',
            fields = data.id > 0 ? `type_id = '${data.type_id}', act_name = '${data.act_name}', modified_by = '${user}', modified_dt = '${datetime}'` : 
            '(type_id, act_name, created_by, created_dt)',
            values = `('${data.type_id}', '${data.act_name}', '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
    getCalEmiType: (id = 0, type_id = 0, act_id = 0) => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.type_id, b.type_name, a.act_id, c.act_name, a.emi_name',
            table_name = 'md_cal_emi_type a, md_cal_type b, md_cal_act c',
            whr = `a.type_id=b.id AND a.act_id=c.id ${id > 0 ? `AND a.id = ${id}` : ''} ${type_id > 0 ? `AND a.type_id = ${type_id}` : ''} ${act_id > 0 ? `AND a.act_id = ${act_id}` : ''}`,
            order = 'ORDER BY a.emi_name';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveCalEmiType: (data, user) => {
        return new Promise(async (resolve, reject) => {
            var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var table_name = 'md_cal_emi_type',
            fields = data.id > 0 ? `type_id = '${data.type_id}', act_id = '${data.act_id}', emi_name = '${data.emi_name}', modified_by = '${user}', modified_dt = '${datetime}'` : 
            '(type_id, act_id, emi_name, created_by, created_dt)',
            values = `('${data.type_id}', '${data.act_id}', '${data.emi_name}', '${user}', '${datetime}')`,
            whr = data.id > 0 ? `id = ${data.id}` : null,
            flag = data.id > 0 ? 1 : 0;
            var res_dt = await db_Insert(table_name, fields, values, whr, flag)
            resolve(res_dt)
        })
    },
}