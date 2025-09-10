 const { db_Select } = require("./MasterModule")

module.exports = {
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
  }
}