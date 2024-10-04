const express = require("express"),
  UserRouter = express.Router(),
  bcrypt = require("bcrypt"),
  dateFormat = require("dateformat");

const { SendUserEmail, sendOtp } = require("../modules/EmailModule");
const {
  db_Select,
  USER_TYPE_LIST,
  CALCULATOR_LANG,
  db_Insert,
  PLAN_LIST,
} = require("../modules/MasterModule");
const {
  getUserList,
  saveUser,
  getClientList,
  saveClientData,
} = require("../modules/UserModule");

UserRouter.use((req, res, next) => {
  if (
    req.url != "/login" &&
    req.url != "/forgot_pass" &&
    req.url != "/chk_user_login" &&
    req.url != "/fast_login"
  ) {
    var url = req.url.split("?");
    var currUrl = url.length > 0 ? url[0] : "";
    if (currUrl != "/reset_pass") {
      var user = req.session.user;
      if (user) {
        next();
      } else {
        res.redirect("/login");
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

UserRouter.get("/login", (req, res) => {
  // var dt = new Date();
  // console.log(dt);
  // console.log(new Date(dt.setMonth(dt.getMonth()+6)));
  let user = req.session.user;
  if (user) {
    res.redirect("/dashboard");
  } else {
    res.render("pages/login");
  }
});

UserRouter.post("/login", async (req, res) => {
  var data = req.body;
  // dynamicNotify('fa fa-bell-o', 'Success', 'Test notification', 'success')
  var select =
      "id, client_id, user_name, user_id, password, user_type, active_flag, fast_login, login_dt",
    table_name = "md_user",
    whr = `user_id = '${data.email}' AND active_flag = 'Y'`,
    order = null;
  var chk_dt = await db_Select(select, table_name, whr, order);
  if (chk_dt.suc > 0) {
    // console.log(await bcrypt.compare(data.password, chk_dt.msg[0].password));
    if (chk_dt.msg.length > 0) {
      if (await bcrypt.compare(data.password, chk_dt.msg[0].password)) {
        try {
          await updateLoginStatus(
            chk_dt.msg[0].id,
            chk_dt.msg[0].user_name,
            "I"
          );
        } catch (err) {
          console.log(err);
        }
        req.session.user = chk_dt.msg[0];
        if (chk_dt.msg[0].user_type != "S") {
          var select =
              "id, ai_tag_tool_flag, ghg_emi_flag, ifrs_flag, ifrs_fr_flag, esrs_flag, esrs_fr_flag, esrs_vsme_flag, esrs_vsme_fr_flag, gri_flag, gri_fr_flag, cal_lang_flag",
            table_name = "td_client",
            whr = `id = '${chk_dt.msg[0].client_id}'`,
            order = null;
          var client_dt = await db_Select(select, table_name, whr, order);
          req.session.user["ai_tag_tool_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].ai_tag_tool_flag
                : "N"
              : "N";
          req.session.user["ghg_emi_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].ghg_emi_flag
                : "N"
              : "N";
          req.session.user["ifrs_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].ifrs_flag
                : "N"
              : "N";
          req.session.user["ifrs_fr_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].ifrs_fr_flag
                : "N"
              : "N";
          req.session.user["esrs_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].esrs_flag
                : "N"
              : "N";
          req.session.user["esrs_fr_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].esrs_fr_flag
                : "N"
              : "N";
          req.session.user["esrs_vsme_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].esrs_vsme_flag
                : "N"
              : "N";
          req.session.user["esrs_vsme_fr_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].esrs_vsme_fr_flag
                : "N"
              : "N";
          req.session.user["gri_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].gri_flag
                : "N"
              : "N";
          req.session.user["gri_fr_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].gri_fr_flag
                : "N"
              : "N";
          req.session.user["cal_lang_flag"] =
            client_dt.suc > 0
              ? client_dt.msg.length > 0
                ? client_dt.msg[0].cal_lang_flag
                : "N"
              : "N";

          if (data.rem_me == "Y") {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
          }
        }
        req.session.videoPopUp = true;
        res.redirect("/fast_login");
      } else {
        req.session.message = {
          type: "warning",
          message: "Please check your username or password",
        };
        res.redirect("/login");
      }
    } else {
      req.session.message = { type: "warning", message: "Incorrect username" };
      res.redirect("/login");
    }
  } else {
    req.session.message = { type: "danger", message: chk_dt.msg };
    res.redirect("/login");
  }
  // res.send(data)
});

const updateLoginStatus = (user_id, user_name, type) => {
  return new Promise(async (resolve, reject) => {
    var curr_dt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var table_name = "md_user",
      fields = `${
        type == "I" ? `login_dt = '${curr_dt}'` : `logout_dt = '${curr_dt}'`
      }, modified_by = '${user_name}', modified_dt = '${curr_dt}'`,
      values = null,
      whr = `id = '${user_id}'`,
      flag = 1;
    var res_dt = await db_Insert(table_name, fields, values, whr, flag);

    var table_name = "td_login_log",
      fields = `(user_id, log_dt, flag)`,
      values = `('${user_id}', '${curr_dt}', '${type}')`,
      whr = null,
      flag = 0;
    var log_dt = await db_Insert(table_name, fields, values, whr, flag);

    resolve(res_dt);
  });
};

UserRouter.post("/chk_user_login", async (req, res) => {
  var data = req.body,
    res_dt = "";
  // dynamicNotify('fa fa-bell-o', 'Success', 'Test notification', 'success')
  var select =
      "id, client_id, user_name, user_id, password, user_type, active_flag",
    table_name = "md_user",
    whr = `user_id = '${data.email}' AND active_flag = 'Y'`,
    order = null;
  var chk_dt = await db_Select(select, table_name, whr, order);
  if (chk_dt.suc > 0) {
    // console.log(await bcrypt.compare(data.password, chk_dt.msg[0].password));
    if (chk_dt.msg.length > 0) {
      if (await bcrypt.compare(data.password, chk_dt.msg[0].password)) {
        if (chk_dt.msg[0].user_type != "S") {
          var otp = Math.floor(1000 + Math.random() * 9000);
          console.log(otp);
          // req.session.message = {otp: otp}
          var send_email = await sendOtp(data.email, chk_dt.msg[0].user_name, otp)
          if(send_email.suc > 0){
          res_dt = { suc: 1, msg: chk_dt.msg[0], pin: otp };
          }else{
            res_dt = {suc: 0, msg: 'Email not send please try again after some time.'}
          }
        } else {
          res_dt = { suc: 1, msg: chk_dt.msg[0], pin: 0 };
        }
      } else {
        res_dt = { suc: 0, msg: "Please check your username or password" };
      }
    } else {
      res_dt = { suc: 0, msg: "Incorrect username" };
    }
  } else {
    res_dt = { suc: 0, msg: chk_dt.msg };
  }
  res.send(res_dt);
});

UserRouter.get("/log_out", async (req, res) => {
  var data = req.session.user;
  try {
    console.log(data);
    if (data) {
      await updateLoginStatus(data.id, data.user_name, "O");
    }
  } catch (err) {
    console.log(err);
  }
  req.session.destroy();
  res.redirect("/login");
});

UserRouter.get("/forgot_pass", (req, res) => {
  res.render("pages/forgot_password");
});

UserRouter.post("/forgot_pass", async (req, res) => {
  var data = req.body;
  var select = "id, client_id, user_name, user_id, user_type, active_flag",
    table_name = "md_user",
    whr = `user_id = '${data.email}'`,
    order = null;
  var chk_dt = await db_Select(select, table_name, whr, order);
  if (chk_dt.suc > 0) {
    if (chk_dt.msg.length > 0) {
      if (chk_dt.msg[0].active_flag == "Y") {
        var enc_dt = Buffer.from(
          JSON.stringify({
            email_id: data.email,
            url_time: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
          })
        ).toString("base64");
        var email_send = await SendUserEmail(
          data.email,
          chk_dt.msg[0].user_name,
          encodeURIComponent(enc_dt)
        );
        if (email_send.suc > 0) {
          req.session.message = {
            type: "success",
            message: "A password-reset link has been sent to your email.",
          };
        } else {
          req.session.message = {
            type: "warning",
            message: "Email not send please try again after some time.",
          };
        }
        res.redirect("/login");
      } else {
        req.session.message = {
          type: "warning",
          message: "Your account is deactivated. Please contact with admin.",
        };
        res.redirect("/forgot_pass");
      }
    } else {
      req.session.message = {
        type: "warning",
        message: "Please enter your valid registered email id",
      };
      res.redirect("/forgot_pass");
    }
  } else {
    req.session.message = {
      type: "warning",
      message: "Something went wrong. Please try again after some time.",
    };
    res.redirect("/forgot_pass");
  }
});

UserRouter.get("/reset_pass", (req, res) => {
  var enc_dt = req.query.enc_dt;
  var data = Buffer.from(decodeURIComponent(enc_dt), "base64");
  data = JSON.parse(data);
  var link_date = new Date(data.url_time),
    nowDate = new Date(),
    maxTime = 2;
  var hours = Math.abs(link_date.getTime() - nowDate.getTime()) / 36e5;
  // console.log(hours, 'Hour');
  if (hours <= maxTime) {
    res.render("pages/forgot_pass_entry", { email: data.email_id });
  } else {
    req.session.message = {
      type: "warning",
      message: "Link expired.",
    };
    res.redirect("/login");
  }
});

UserRouter.post("/reset_pass", async (req, res) => {
  var data = req.body;
  var pass = bcrypt.hashSync(data.pass, 10),
    datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  var table_name = "md_user",
    fields = `password = '${pass}', modified_by = '${data.email}', modified_dt = '${datetime}'`,
    values = null,
    whr = `user_id = '${data.email}'`,
    flag = 1;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag);
  if (res_dt.suc > 0) {
    req.session.message = {
      type: "success",
      message: "Your password was successfully updated",
    };
    res.redirect("/login");
  } else {
    req.session.message = {
      type: "warning",
      message: "Password not update successfully",
    };
    res.redirect("/login");
  }
});

UserRouter.get("/client", async (req, res) => {
  var client_data = await getClientList();
  var data = {
    client_data,
    header: "Client List",
  };
  res.render("client/view", data);
});

UserRouter.get("/client_edit", async (req, res) => {
  var id = req.query.id,
    client_data = [];
  if (id > 0) client_data = await getClientList(id);
  var data = {
    client_data,
    id,
    cal_lang: CALCULATOR_LANG,
    user_type_list: USER_TYPE_LIST,
    sub_list: PLAN_LIST,
    header: "Client List",
    sub_header: "Client Add/Edit",
    header_url: "/client",
  };
  res.render("client/add", data);
});

UserRouter.post("/client_save", async (req, res) => {
  var data = req.body;
  var res_dt = await saveClientData(data, req.session.user.user_name);
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect("/client");
});

UserRouter.get("/manage_user", async (req, res) => {
  var user_data = await getUserList(0, req.session.user.client_id);
  // console.log(user_data);
  var data = {
    user_data,
    user_type_list: USER_TYPE_LIST,
    header: "Manage User",
  };
  res.render("manage_user/view", data);
});

UserRouter.get("/manage_user_edit", async (req, res) => {
  var id = req.query.id,
    user_data = [];
  if (id > 0) user_data = await getUserList(id, req.session.user.client_id);
  var data = {
    user_data,
    id,
    user_type_list: USER_TYPE_LIST,
    header: "Manage User",
    sub_header: "Manage User Add/Edit",
    header_url: "/manage_user",
  };
  res.render("manage_user/add", data);
});

UserRouter.post("/manage_user_save", async (req, res) => {
  var data = req.body;
  var res_dt = await saveUser(
    data,
    req.session.user.user_name,
    req.session.user.client_id
  );
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  res.redirect("/manage_user");
});

UserRouter.post("/get_client_user_list_ajax", async (req, res) => {
  var data = req.body,
    client_id = req.session.user.client_id;
  var res_dt = await getUserList(0, client_id, data.flag);
  res_dt["user_type_list"] = USER_TYPE_LIST;
  res.send(res_dt);
});

UserRouter.get("/fast_login", async (req, res) => {
  var ses_data = req.session.user;
  if (ses_data) {
    if (ses_data.fast_login != "N") {
      res.render("pages/fast_login");
    } else {
      res.redirect("/dashboard");
    }
  } else {
    req.session.message = {
      header: "Change Password",
      type: "warning",
      message: "Session Expired",
    };
    res.redirect("/login");
  }
});

UserRouter.post("/fast_login", async (req, res) => {
  var data = req.body;
  if (req.session.user) {
    var select = "id, password",
      table_name = "md_user",
      whr = `user_id = '${req.session.user.user_id}' AND active_flag = 'Y' AND fast_login = 'Y'`,
      order = null;
    var chk_dt = await db_Select(select, table_name, whr, order);
    if (chk_dt.suc > 0 && chk_dt.msg.length > 0) {
      if (await bcrypt.compare(data.old_pass, chk_dt.msg[0].password)) {
        var pass = bcrypt.hashSync(data.pass, 10),
          datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
        var table_name = "md_user",
          fields = `password = '${pass}', fast_login = 'N', modified_by = '${req.session.user.user_name}', modified_dt = '${datetime}'`,
          values = null,
          whr = `id = ${chk_dt.msg[0].id}`,
          flag = 1;
        var res_dt = await db_Insert(table_name, fields, values, whr, flag);
        if (res_dt.suc > 0) {
          req.session.message = {
            header: "Change Password",
            type: "success",
            message: "Password changed successfully.",
          };
          res.redirect("/dashboard");
        } else {
          req.session.message = {
            header: "Change Password",
            type: "error",
            message: "Error occurs while updating password.",
          };
          res.redirect("/fast_login");
        }
      } else {
        req.session.message = {
          header: "Change Password",
          type: "error",
          message: "Old password does not match.",
        };
        res.redirect("/fast_login");
      }
    } else {
      req.session.message = {
        header: "Change Password",
        type: "error",
        message: "No user found or user has been deactivated.",
      };
      res.redirect("/login");
    }
  } else {
    req.session.message = {
      header: "Login",
      type: "warning",
      message: "Session Expired",
    };
    res.redirect("/login");
  }
});

UserRouter.get("/user_list", async (req, res) => {
  var data = req.query;
  var user_dt = await db_Select(
    "id, user_name, user_type, active_flag, fast_login, login_dt, logout_dt",
    "md_user",
    `client_id = '${data.client_id}' AND active_flag = 'Y'`,
    null
  );
  if (user_dt.suc > 0 && user_dt.msg.length > 0) {
    for (let dt of user_dt.msg) {
      var user_log = await db_Select(
        "id, user_id, log_dt, flag",
        "td_login_log",
        `user_id = ${dt.id}`,
        "order by log_dt"
      );
      dt["user_log"] = user_log.suc > 0 ? user_log.msg : [];
    }
  }
  var view_data = {
    user_dt,
    dateFormat,
    client_id: data.client_id,
    user_type_list: USER_TYPE_LIST,
    header_url: "/client",
    sub_header: "Client User List",
    header: "Client List",
  };
  res.render("client/user_view", view_data);
});

UserRouter.get('/deactive_user', async (req, res) => {
  var data = req.query
  // console.log(data,'iiii');
  var table_name = "md_user",
  fields = `active_flag = 'N'`,
  values = null,
  whr = `id = ${data.id}`,
  flag = 1;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag)
  // console.log(res_dt,'test');
  res.redirect(`/user_list?client_id=${data.client_id}`);
});

UserRouter.get('/deactive_client', async (req, res) =>{
  var data = req.query
  // console.log(data,'ooo');
  var table_name = "td_client",
  fields = `active_flag = 'N'`,
  values = null,
  whr = `id = ${data.id}`,
  flag = 1;
  var dt = await db_Insert(table_name, fields, values, whr, flag)

  if(dt.suc > 0 && dt.msg.length > 0){
    var table_name = "md_user",
    fields = `active_flag = 'N'`,
    values = null,
    whr = `client_id = ${data.id}`,
    flag = 1;
    var client_dt = await db_Insert(table_name, fields, values, whr, flag)
  }
  res.redirect(`/client`);
})

module.exports = { UserRouter };
