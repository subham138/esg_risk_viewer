const { db_Select, db_Insert, db_Routine } = require("./MasterModule");
const bcrypt = require("bcrypt"),
  dateFormat = require("dateformat");
const { SaveSubsData } = require("./SubscModule");

module.exports = {
  getUserList: (id = null, client_id, active_flag = null) => {
    return new Promise(async (resolve, reject) => {
      var select =
          "a.id, a.user_name, a.user_id, b.client_name, a.user_type, a.active_flag",
        table_name = "md_user a, td_client b",
        whr = `a.client_id=b.id AND a.user_type NOT IN('S', 'C') AND a.client_id = ${client_id} ${
          id > 0 ? `AND a.id = ${id}` : ""
        } ${
          active_flag && active_flag != "A"
            ? `AND active_flag = '${active_flag}'`
            : ""
        }`,
        order = `ORDER BY a.id desc`;
      var res_dt = await db_Select(select, table_name, whr, order);
      resolve(res_dt);
    });
  },
  // MODIFIED BY VIKASH //
  getMonthlyUser: (client_id) => {
    return new Promise(async (resolve, reject) => {
      var select = "SELECT u2.id, u2.user_name,u2.user_id FROM md_user u1 JOIN md_user u2 ON u1.client_id = u2.client_id AND u1.id <> u2.id JOIN stripe_subscriptions stripe ON u1.id = stripe.user_id WHERE u2.client_id=" + client_id + " AND stripe.month_yearly = 'Month' AND stripe.status = 'active' ORDER BY u2.created_dt ASC LIMIT 2";
      var res_dt = await db_Routine(select);
      resolve(res_dt);
    });
  },
  updateUser: (data, user, client_id) => {
    return new Promise(async (resolve, reject) => {
      var pass = bcrypt.hashSync(data.password, 10),
        datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

      var table_name = "md_user",
        fields =
          data.id > 0
            ? `user_name = '${data.user_name}', password = '${pass}'`
            : `(user_name,password)`,
        values = `('${client_id}', '${data.user_name}', '${data.user_type}', '${data.user_id}', '${pass}', '${data.active_flag}', '${user}', '${datetime}')`,
        whr = data.id > 0 ? `id = ${data.id}` : null,
        flag = 1;
      var res_dt = await db_Insert(table_name, fields, values, whr, flag);
      resolve(res_dt);
    });
  },
  // END //
  saveUser: (data, user, client_id) => {
    return new Promise(async (resolve, reject) => {
      var pass = bcrypt.hashSync(data.password, 10),
        datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

      var table_name = "md_user",
        fields =
          data.id > 0
            ? `user_name = '${data.user_name}', user_type = '${data.user_type}', user_id = '${data.user_id}', password = '${pass}', active_flag = '${data.active_flag}', modified_by = '${user}', modified_dt = '${datetime}'`
            : `(client_id, user_name, user_type, user_id, password, active_flag, created_by, created_dt)`,
        values = `('${client_id}', '${data.user_name}', '${data.user_type}', '${data.user_id}', '${pass}', '${data.active_flag}', '${user}', '${datetime}')`,
        whr = data.id > 0 ? `id = ${data.id}` : null,
        flag = data.id > 0 ? 1 : 0;
      var res_dt = await db_Insert(table_name, fields, values, whr, flag);
      resolve(res_dt);
    });
  },
  getClientList: (id = null) => {
    return new Promise(async (resolve, reject) => {
      var select =
          "a.id, a.client_name, b.user_name, b.user_id, b.user_type, a.plan_type, a.plan_active_dt, DATEDIFF(a.plan_deactive_dt,a.plan_active_dt) AS diff_dt, a.ai_tag_tool_flag, a.ghg_emi_flag, a.ifrs_flag, a.esrs_flag, a.gri_flag, a.gri_fr_flag, a.ifrs_fr_flag, a.esrs_fr_flag, a.esrs_vsme_flag, a.esrs_vsme_fr_flag, a.cal_lang_flag, a.platform_mode",
        table_name = "td_client a, md_user b",
        whr = `a.id=b.client_id AND a.active_flag = 'Y'AND  b.user_type = 'C' ${
          id > 0 ? `AND a.id = ${id}` : ""
        } `,
        order = null;
      var res_dt = await db_Select(select, table_name, whr, order);
      resolve(res_dt);
    });
  },
  saveClientData: (data, user) => {
    return new Promise(async (resolve, reject) => {
      // console.log(data, data.ai_tag_tool_flag, 'data flag');
      var pass = bcrypt.hashSync(data.password, 10),
        datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

      var table_name = "td_client",
        fields =
          data.id > 0
            ? `client_name = '${data.client_name}', platform_mode='${data.platform_mode}', plan_type = 'N', ai_tag_tool_flag = '${data.ai_tag_tool_flag}', ghg_emi_flag = '${data.ghg_emi_flag}', ifrs_flag = '${data.ifrs_flag}', ifrs_fr_flag = '${data.ifrs_fr_flag}', esrs_flag = '${data.esrs_flag}', esrs_fr_flag = '${data.esrs_fr_flag}', esrs_vsme_flag = '${data.esrs_vsme_flag}', esrs_vsme_fr_flag = '${data.esrs_vsme_fr_flag}', gri_flag = '${data.gri_flag}', gri_fr_flag = '${data.gri_fr_flag}', cal_lang_flag = '${data.cal_lang_flag}', modified_by = '${user}', modified_dt = '${datetime}'`
            : `(entry_dt, client_name, platform_mode, plan_type, ai_tag_tool_flag, ghg_emi_flag, ifrs_flag, ifrs_fr_flag, esrs_flag, esrs_fr_flag, esrs_vsme_flag, esrs_vsme_fr_flag, gri_flag, gri_fr_flag, cal_lang_flag, created_by, created_dt)`,
        values = `('${datetime}', '${data.client_name}', '${data.platform_mode}', 'N', '${
          data.ai_tag_tool_flag ? data.ai_tag_tool_flag : "N"
        }', '${data.ghg_emi_flag ? data.ghg_emi_flag : "N"}', '${
          data.ifrs_flag ? data.ifrs_flag : "N"
        }', '${data.ifrs_fr_flag ? data.ifrs_fr_flag : "N"}', '${
          data.esrs_flag ? data.esrs_flag : "N"
        }', '${data.esrs_fr_flag ? data.esrs_fr_flag : "N"}', '${
          data.esrs_vsme_flag ? data.esrs_vsme_flag : "N"
        }', '${data.esrs_vsme_fr_flag ? data.esrs_vsme_fr_flag : "N"}', '${
          data.gri_flag ? data.gri_flag : "N"
        }', '${data.gri_fr_flag ? data.gri_fr_flag : "N"}', '${
          data.cal_lang_flag ? data.cal_lang_flag : "N"
        }', '${user}', '${datetime}')`,
        whr = data.id > 0 ? `id = ${data.id}` : null,
        flag = data.id > 0 ? 1 : 0;
      var client_data = await db_Insert(table_name, fields, values, whr, flag);

      var client_id =
        data.id > 0
          ? data.id
          : client_data.suc > 0
          ? client_data.lastId.insertId
          : 0;

      if (data.plan_type != "" && data.plan_type) {
        await SaveSubsData(user, client_id, data.plan_type);
      }

      var select = "id",
        table_name = "md_user",
        whr = `client_id = ${client_id} AND user_id = '${data.user_id}'`,
        order = null;
      var chk_dt = await db_Select(select, table_name, whr, order);

      var table_name = "md_user",
      // MODIFIED BY VIKASH //
        fields =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `user_name = '${data.user_name}', user_type = 'C', country = '${data.country}',policy = '${data.policy}', user_id = '${data.user_id}', active_flag = 'Y', modified_by = '${user}', modified_dt = '${datetime}'`
            : `(client_id, user_name, user_type,country,policy, user_id, password, active_flag, created_by, created_dt)`,
        values = `('${client_id}', '${data.user_name}', 'C', '${data.country}', '${data.policy}', '${data.user_id}', '${pass}', 'Y', '${user}', '${datetime}')`,
        // END //
        whr =
          chk_dt.suc > 0 && chk_dt.msg.length > 0
            ? `id = ${chk_dt.msg[0].id}`
            : null,
        flag = chk_dt.suc > 0 && chk_dt.msg.length > 0 ? 1 : 0;
      var res_dt = await db_Insert(table_name, fields, values, whr, flag);
      resolve(res_dt);
    });
  },
};
