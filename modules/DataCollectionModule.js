const { db_Select, db_Insert } = require("./MasterModule"),
  dateFormat = require("dateformat");

module.exports = {
  getSusDiscList: (sec_id, ind_id, top_id, flag = "I") => {
    return new Promise(async (resolve, reject) => {
      var select =
          "a.id, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.top_id, a.sl_no, a.ind_agn, a.metric, a.catg, a.unit, a.code, e.topic_name, a.words, f.point_codes info_title",
        table_name =
          `td_sus_dis_top_met a
          JOIN md_sector b ON a.sec_id=b.id
          JOIN md_industries c ON a.ind_id=c.id AND b.id=c.sec_id
          JOIN md_industries_topics d ON a.top_id=d.id
          JOIN md_topic e ON d.topic_id=e.id
          LEFT JOIN md_data_point_dt f ON a.id=f.sus_dis_top_met_id`,
        whr = `a.repo_flag = '${flag}' ${
          sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ""
        } ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ""} ${
          top_id > 0 ? `AND a.top_id = ${top_id}` : ""
        }`,
        order = "GROUP BY a.id ORDER BY a.top_id, a.sl_no";
      var res_dt = await db_Select(select, table_name, whr, order);
      resolve(res_dt);
    });
  },
  getActMetrialDtls: (sec_id, ind_id, flag = "I") => {
    return new Promise(async (resolve, reject) => {
      var select =
          "a.id, a.sec_id, b.sec_name, a.ind_id, b.sec_name, a.sl_no, a.act_metric, a.catg, a.unit, a.code",
        table_name = "td_act_metrics a, md_sector b, md_industries c",
        whr = `a.sec_id=b.id AND a.ind_id=c.id AND b.id=c.sec_id AND a.repo_flag = '${flag}' ${
          sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ""
        } ${ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ""}`,
        order = "ORDER BY a.sl_no";
      var res_dt = await db_Select(select, table_name, whr, order);
      resolve(res_dt);
    });
  },
  getDynamicData: (
    id = null,
    sec_id = null,
    ind_id = null,
    topic_id = null,
    flag = "I"
  ) => {
    return new Promise(async (resolve, reject) => {
      var select =
          "a.id, a.dt_year, a.sec_id, b.sec_name, a.ind_id, c.ind_name, a.top_id, e.topic_name, a.data_file_name",
        table_name =
          "td_data_collection a, md_sector b, md_industries c, md_industries_topics d, md_topic e",
        whr = `a.sec_id=b.id AND a.ind_id=c.id AND a.top_id=d.id AND a.ind_id = d.ind_id AND d.topic_id=e.id AND a.repo_flag = '${flag}' ${
          id > 0 ? `AND a.id = ${id}` : ""
        } ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ""} ${
          ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ""
        } ${topic_id > 0 ? `AND a.top_id = ${topic_id}` : ""}`,
        order = "ORDER BY a.id";
      var res_dt = await db_Select(select, table_name, whr, order);
      resolve(res_dt);
    });
  },
  getSusDisTopCodeList: (
    id = 0,
    sec_id = null,
    ind_id = null,
    topic_id = null,
    flag = "I"
  ) => {
    return new Promise(async (resolve, reject) => {
      var select = "a.id, a.code, a.words",
        table_name = "td_sus_dis_top_met a",
        whr = `a.words is NOT null AND a.words != '' AND a.repo_flag = '${flag}' ${
          id > 0 ? `AND a.id = ${id}` : ""
        } ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ""} ${
          ind_id > 0 ? `AND a.ind_id = ${ind_id}` : ""
        } ${topic_id > 0 ? `AND a.top_id = ${topic_id}` : ""}`,
        order = "ORDER BY a.sl_no";
      var res_dt = await db_Select(select, table_name, whr, order);
      resolve(res_dt);
    });
  },
  getWordInfo: (id = 0, top_id = 0, bus_id = 0, word = "", bus_id_list = 0) => {
    return new Promise(async (resolve, reject) => {
      if (word != "") {
        var select =
            "a.id, a.sus_dis_top_met_id, a.word, a.sl_no, a.info, a.bus_id, b.busi_act_name",
          table_name = "td_sus_dis_top_word_info a, md_busi_act b",
          whr = `a.bus_id = b.id AND a.word = '${word}' AND bus_id IN (${bus_id_list})`,
          order = "ORDER BY a.bus_id, a.sl_no";
        var res_dt = await db_Select(select, table_name, whr, order);
        resolve(res_dt);
      } else {
        var select = "id, sus_dis_top_met_id, word, sl_no, info",
          table_name = "td_sus_dis_top_word_info",
          whr =
            id > 0
              ? `id = ${id}`
              : top_id > 0
              ? `sus_dis_top_met_id = ${top_id} ${
                  bus_id > 0 ? `AND bus_id = ${bus_id}` : ""
                }`
              : word != ""
              ? `word = '${word}'`
              : "",
          order = "ORDER BY sl_no";
        var res_dt = await db_Select(select, table_name, whr, order);
        resolve(res_dt);
      }
    });
  },
  getCopyLatestWordInfoSet: (top_id) => {
    return new Promise(async (resolve, reject) => {
      var select = "MAX(created_dt) max_dt",
        table_name = "td_sus_dis_top_word_info",
        whr = `sus_dis_top_met_id = ${top_id}`,
        order = null;
      var chk_dt = await db_Select(select, table_name, whr, order);
      console.log(chk_dt);
      if (chk_dt.suc > 0) {
        if (chk_dt.msg.length > 0) {
          var select = "DISTINCT bus_id, created_dt",
            table_name = "td_sus_dis_top_word_info",
            whr = `sus_dis_top_met_id = ${top_id} AND created_dt = '${dateFormat(
              chk_dt.msg[0].max_dt,
              "yyyy-mm-dd HH:MM:ss"
            )}'`,
            order = `ORDER BY created_dt DESC LIMIT 1`;
          var bus_dt = await db_Select(select, table_name, whr, order);
          console.log(bus_dt);
          if (bus_dt.suc > 0) {
            if (bus_dt.msg.length > 0) {
              var select = "id, sus_dis_top_met_id, word, sl_no, info",
                table_name = "td_sus_dis_top_word_info",
                whr = `sus_dis_top_met_id = ${top_id} AND bus_id = ${bus_dt.msg[0].bus_id}`,
                order = "ORDER BY sl_no";
              var res_dt = await db_Select(select, table_name, whr, order);
              console.log(res_dt);
              resolve(res_dt);
            } else {
              resolve({ suc: 0, msg: "No Data Found" });
            }
          } else {
            resolve(bus_dt);
          }
        } else {
          resolve({ suc: 0, msg: "No Data Found" });
        }
      } else {
        resolve(chk_dt);
      }
    });
  },
  saveWordInfo: (data, user) => {
    return new Promise(async (resolve, reject) => {
      var res_dt = {};
      var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
      for (let wrd_id of data.word_name_id) {
        var i = 0;
        if (Array.isArray(data[`info_${wrd_id}`])) {
          for (let dt of data[`info_${wrd_id}`]) {
            // console.log(i, data[`info_id_${wrd_id}`][i], ' ----->>>>> INFO ID');
            // console.log(i, dt, ' ----->>>>> INFO');
            if (dt != "") {
              var table_name = "td_sus_dis_top_word_info",
                fields =
                  data[`info_id_${wrd_id}`][i] > 0
                    ? `bus_id = '${data.bus_id}', word = '${
                        data.word_name[wrd_id - 1]
                      }', sl_no = ${i + 1}, info = '${dt
                        .split("'")
                        .join(
                          "\\'"
                        )}', modified_by = '${user}', modified_dt = '${datetime}'`
                    : "(sus_dis_top_met_id, bus_id, word, sl_no, info, created_by, created_dt)",
                values = `(${data.code_id}, '${data.bus_id}', '${
                  data.word_name[wrd_id - 1]
                }', ${i + 1}, '${dt
                  .split("'")
                  .join("\\'")}', '${user}', '${datetime}')`,
                whr =
                  data[`info_id_${wrd_id}`][i] > 0
                    ? `id = ${data[`info_id_${wrd_id}`][i]}`
                    : null,
                flag = data[`info_id_${wrd_id}`][i] > 0 ? 1 : 0;
              res_dt = await db_Insert(table_name, fields, values, whr, flag);
              i++;
            }
          }
        } else {
          if (data[`info_${wrd_id}`] != "") {
            var table_name = "td_sus_dis_top_word_info",
              fields =
                data[`info_id_${wrd_id}`] > 0
                  ? `bus_id = '${data.bus_id}', word = '${
                      data.word_name[wrd_id - 1]
                    }', info = '${data[`info_${wrd_id}`]
                      .split("'")
                      .join(
                        "\\'"
                      )}', modified_by = '${user}', modified_dt = '${datetime}'`
                  : "(sus_dis_top_met_id, bus_id, word, sl_no, info, created_by, created_dt)",
              values = `(${data.code_id}, '${data.bus_id}', '${
                data.word_name[wrd_id - 1]
              }', ${i + 1}, '${data[`info_${wrd_id}`]
                .split("'")
                .join("\\'")}', '${user}', '${datetime}')`,
              whr =
                data[`info_id_${wrd_id}`] > 0
                  ? `id = ${data[`info_id_${wrd_id}`]}`
                  : null,
              flag = data[`info_id_${wrd_id}`] > 0 ? 1 : 0;
            res_dt = await db_Insert(table_name, fields, values, whr, flag);
          } else {
            res_dt = {
              suc: res_dt.suc ? res_dt.suc : 0,
              msg: res_dt.msg ? res_dt.msg : "No Info found..",
            };
          }
        }
      }
      resolve(res_dt);
    });
  },
  getRiskOprnDtls: (flag, sec_id, ind_id) => {
    return new Promise(async (resolve, reject) => {
      var select = "id, flag, sec_id, ind_id, risk_info",
        table_name = "md_risk_opr",
        whr = `flag = '${flag}' AND sec_id = ${sec_id} AND ind_id = ${ind_id}`,
        order = null;
      var res_dt = await db_Select(select, table_name, whr, order);
      resolve(res_dt);
    });
  },
  getDataPoint: (flag) => {
    return new Promise(async (resolve, reject) => {
      var select = "DISTINCT a.sec_id, a.ind_id, c.ind_name, b.sec_name, COUNT(a.id) tot_ind_point_entry",
        table_name = `md_data_point_dt a, md_sector b, md_industries c`,
        whr = `a.sec_id=b.id AND a.ind_id=c.id AND a.repo_flag = '${flag}'`,
        order = 'GROUP BY a.sec_id, a.ind_id';
      var res_dt = await db_Select(select, table_name, whr, order);
      resolve(res_dt)
    })
  },
  getDataPointListAjax: (flag, sec_id, ind_id) => {

  },
  getDataPointList: (flag, sec_id = 0, ind_id = 0) => {
    return new Promise(async (resolve, reject) => {
      var select = "a.id sus_id, a.ind_id, a.code, b.id, b.repo_flag, b.sec_id, b.sus_dis_top_met_id, b.repo_flag_id, b.point_codes, e.topic_name",
        table_name = `td_sus_dis_top_met a
        JOIN md_industries_topics d ON a.top_id=d.id AND a.repo_flag=d.repo_flag AND a.ind_id=d.ind_id JOIN md_topic e ON d.topic_id=e.id AND d.repo_flag=e.repo_flag
        LEFT JOIN md_data_point_dt b ON a.id=b.sus_dis_top_met_id AND a.ind_id=b.ind_id AND a.sec_id=b.sec_id AND a.repo_flag=b.repo_flag ${sec_id > 0 ? `AND b.sec_id = ${sec_id}` : ''}`,
        whr = `a.repo_flag = '${flag}' ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ''} ${sec_id > 0 ? `AND a.ind_id = ${ind_id}` : ''}`,
        order = `HAVING a.code != '' ORDER BY a.id, b.id`;
      var res_dt = await db_Select(select, table_name, whr, order);
      
      var select = "id, repo_flag, img_path",
        table_name = "md_data_point",
        whr = `repo_flag = '${flag}'`,
        order = null;
      var res_pic_dt = await db_Select(select, table_name, whr, order);
      res_dt["flag_img"] = res_pic_dt.suc > 0 ? (res_pic_dt.msg.length > 0 ? res_pic_dt.msg[0].img_path : '') : '';
      resolve(res_dt);
    });
  }
};
