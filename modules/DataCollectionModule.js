const { db_Select, db_Insert } = require("./MasterModule")

module.exports = {
    getSusDiscList: (sec_id, ind_id, top_id, flag = 'I') => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.top_id, a.sl_no, a.ind_agn, a.metric, a.catg, a.unit, a.code, e.topic_name, a.words, a.info_title, a.info_desc',
            table_name = 'td_sus_dis_top_met a, md_sector b, md_industries c, md_industries_topics d, md_topic e',
            whr = `a.sec_id=b.id AND a.ind_id=c.id AND b.id=c.sec_id AND a.top_id=d.id AND d.topic_id=e.id AND a.repo_flag = '${flag}' ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ''} ${top_id > 0 ? `AND a.top_id = ${top_id}` : ''}`,
            order = 'ORDER BY a.top_id, a.sl_no';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    getActMetrialDtls: (sec_id, ind_id, flag = 'I') => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.sec_id, b.sec_name, a.ind_id, b.sec_name, a.sl_no, a.act_metric, a.catg, a.unit, a.code',
            table_name = 'td_act_metrics a, md_sector b, md_industries c',
            whr = `a.sec_id=b.id AND a.ind_id=c.id AND b.id=c.sec_id AND a.repo_flag = '${flag}' ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ''}`,
            order = 'ORDER BY a.sl_no';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    getDynamicData: (id=null, sec_id = null, ind_id = null, topic_id = null, flag = 'I') => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.dt_year, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.top_id, e.topic_name, a.data_file_name',
            table_name = 'td_data_collection a, md_sector b, md_industries c, md_industries_topics d, md_topic e',
            whr = `a.sec_id=b.id AND a.ind_id=c.id AND a.top_id=d.id AND a.ind_id = d.ind_id AND d.topic_id=e.id AND a.repo_flag = '${flag}' ${id > 0 ? `AND a.id = ${id}` : ''} ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ''} ${topic_id > 0 ? `AND a.top_id = ${topic_id}` : ''}`,
            order = 'ORDER BY a.id';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    getSusDisTopCodeList: (id=0, sec_id = null, ind_id = null, topic_id = null, flag = 'I') => {
        return new Promise(async (resolve, reject) => {
            var select = 'a.id, a.code, a.words',
            table_name = 'td_sus_dis_top_met a',
            whr = `a.words is NOT null AND a.words != '' AND a.repo_flag = '${flag}' ${id > 0 ? `AND a.id = ${id}` : ''} ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ''} ${topic_id > 0 ? `AND a.top_id = ${topic_id}` : ''}`,
            order = 'ORDER BY a.sl_no';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    getWordInfo: (id=0, top_id = 0, word = '') => {
        return new Promise(async (resolve, reject) => {
            var select = 'id, sus_dis_top_met_id, word, sl_no, info',
            table_name = 'td_sus_dis_top_word_info',
            whr = id > 0 ? `id = ${id}` : (top_id > 0 ? `sus_dis_top_met_id = ${top_id}` : (word != '' ? `word = '${word}'` : '') ),
            order = 'ORDER BY sl_no';
            var res_dt = await db_Select(select, table_name, whr, order)
            resolve(res_dt)
        })
    },
    saveWordInfo: (data) => {
        return new Promise(async (resolve, reject) => {
            var res_dt = {}
            for(let wrd_id of data.word_name_id){
                var i = 0
                if(Array.isArray(data[`info_${wrd_id}`])){
                    for(let dt of data[`info_${wrd_id}`]){
                        var table_name = 'td_sus_dis_top_word_info',
                            fields = data[`info_id_${wrd_id}`][i] > 0 ? `word = '${data.word_name[wrd_id-1]}', sl_no = ${i+1}, info = '${dt.split("'").join("\\'")}'` : '(sus_dis_top_met_id, word, sl_no, info)',
                            values = `(${data.code_id}, '${data.word_name[wrd_id-1]}', ${i+1}, '${dt.split("'").join("\\'")}')`,
                            whr = data[`info_id_${wrd_id}`][i] > 0 ? `id = ${data[`info_id_${wrd_id}`][i] > 0}` : null,
                            flag = data[`info_id_${wrd_id}`][i] > 0 ? 1 : 0;
                        res_dt = await db_Insert(table_name, fields, values, whr, flag)
                    }
                }else{
                    if(data[`info_${wrd_id}`] != ''){
                        var table_name = 'td_sus_dis_top_word_info',
                            fields = data[`info_id_${wrd_id}`] > 0 ? `word = '${data.word_name[wrd_id-1]}', info = '${data[`info_${wrd_id}`].split("'").join("\\'")}'` : '(sus_dis_top_met_id, word, sl_no, info)',
                            values = `(${data.code_id}, '${data.word_name[wrd_id-1]}', ${i+1}, '${data[`info_${wrd_id}`].split("'").join("\\'")}')`,
                            whr = data[`info_id_${wrd_id}`] > 0 ? `id = ${data[`info_id_${wrd_id}`]}` : null,
                            flag = data[`info_id_${wrd_id}`] > 0 ? 1 : 0;
                        res_dt = await db_Insert(table_name, fields, values, whr, flag)
                    }else{
                        res_dt = {suc: res_dt.suc ? res_dt.suc : 0, msg: res_dt.msg ? res_dt.msg : 'No Info found..'}
                    }
                }
            }
            resolve(res_dt)
        })
    }
}