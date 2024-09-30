const { db_Select } = require("./MasterModule")

module.exports = {
  get_form_builder_list: (scope_id = 0, sec_id = 0) => {
    return new Promise(async (resolve, reject) => {
      var qr_dt, q_header, q_scope, q_sec_name, q_type_id, res_dt;
      var resDt = await db_Select(
        "a.*, b.sec_name, b.type_id",
        "md_cal_form_builder a, md_cal_sec_type b",
        `a.sec_id=b.id AND a.scope_id=b.scope_id ${
          scope_id > 0 ? `AND a.scope_id=${scope_id}` : ""
        } ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ""}`,
        "ORDER BY a.id asc"
      );
      if (resDt.suc > 0) {
        var headerFilterDt = resDt.msg.filter((dt) => dt.header_flag != "N");
        var questFilterData = resDt.msg.filter((dt) => dt.header_flag != "Y");
        qr_dt = questFilterData;
        // console.log(headerFilterDt);
        q_header = headerFilterDt[0].input_label;
        q_scope = `Scope ${headerFilterDt[0].scope_id}`;
        q_type_id = headerFilterDt[0].type_id;
        q_sec_name = headerFilterDt[0].sec_name;
        for (let dt of questFilterData) {
          if (dt.input_type != "I") {
            var opDt = await db_Select(
              "id, builder_id, option_name",
              "md_cal_form_builder_option",
              `builder_id=${dt.id}`,
              "ORDER BY id asc"
            );
            dt["options"] = opDt.suc > 0 ? opDt.msg : [];
          }
        }
        res_dt = {
          suc: 1,
          msg: {
            q_header,
            q_scope,
            q_type_id,
            q_sec_name,
            q_data: questFilterData,
          },
        };
        resolve(res_dt);
      } else {
        resolve(resDt);
      }
    });
  },
  get_form_logic_list: (scope_id, sec_id) => {
    return new Promise(async (resolve, reject) => {
        var resDt = await db_Select(
          "a.id, a.input_type, a.input_label, b.option_val, b.action_val, b.next_qst_action_val, b.emi_head_opt1, b.emi_head_opt2, b.emi_head_opt3",
          'md_cal_form_builder a, md_cal_form_build_logic b',
          `a.id=b.quest_id AND a.header_flag != 'Y' ${scope_id > 0 ? `AND a.scope_id=${scope_id}` : ""} ${sec_id > 0 ? `AND a.sec_id = ${sec_id}` : ""}`,
          null
        );
        resolve(resDt);
    })
  },
};