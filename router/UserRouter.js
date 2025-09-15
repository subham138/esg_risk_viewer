const express = require("express"),
  UserRouter = express.Router(),
  bcrypt = require("bcrypt"),
  dateFormat = require("dateformat");

const { SendUserEmail, sendOtp } = require("../modules/EmailModule");
const {
  db_Select,
  db_Insert,
  USER_TYPE_LIST,
  CALCULATOR_LANG,
  PLAN_LIST,
  PLATFORM_MODE,
} = require("../modules/MasterModule");
const {
  getUserList,
  saveUser,
  getClientList,
  saveClientData,
  getMonthlyUser // MODIFIED BY VIKASH //
} = require("../modules/UserModule");

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
// MODIFIED BY VIKASH //
const { TextQueryHandler } = require("puppeteer");
// END //
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// MODIFIED BY VIKASH //
async function isMonthUser(email, client_id) {
  var isUser = await getMonthlyUser(client_id);
  isUser = isUser.msg.map(item => item.user_id)
  if (isUser.includes(email)) {
    return true;
  }
}
// END //

UserRouter.use((req, res, next) => {
  // if (
  //   req.url != "/login" &&
  //   req.url != "/forgot_pass" &&
  //   req.url != "/chk_user_login" &&
  //   req.url != "/fast_login" &&
  //   req.url != "/register"
  // ) {
  //   var url = req.url.split("?");
  //   var currUrl = url.length > 0 ? url[0] : "";
  //   if (currUrl != "/reset_pass") {
  //     var user = req.session.user;
  //     if (user) {
  //       next();
  //     } else {
  //       res.redirect("/login");
  //     }
  //   } else {
  //     next();
  //   }
  // } else {
  //   next();
  // }

  next()
});


UserRouter.get("/register", (req, res) => {
  res.render("pages/register");
});

//manual registration
UserRouter.post("/register", async (req, res) => {
  const { name, email, password, country,policy } = req.body;

  if (!name || !email || !password || !country) {
    req.session.message = { type: "danger", message: "All fields are required" };
  }

  try {

    let hashedPassword = await bcrypt.hashSync(password, 10);

    var table_name = "md_user",
      fields = `(user_name, user_id, password, user_type, country,policy,created_dt)`,
      values = `('${name}', '${email}', '${hashedPassword}', 'C', '${country}', '${policy}','${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}')`,
      whr = null,
      flag = 0;

    var whr = `user_id = '${email}' AND active_flag = 'Y'`;
    var chk_dt = await db_Select("*", table_name, whr, null);
    if (chk_dt.suc > 0 && chk_dt.msg.length > 0) {
       req.session.message = { type: "danger", message: "User already exists" };
    }

    // MODIFIED BY VIKASH //
    var res_dt = await saveClientData({
      client_name: name,
      password: password,
      user_name: name,
      country: country,
      policy: policy,
      user_id: email,
      platform_mode: 'E',
      plan_type: 'B',
      ai_tag_tool_flag: 'N',
      ghg_emi_flag: 'N',
      ifrs_flag: 'N',
      ifrs_fr_flag: 'N',
      esrs_flag: 'N',
      esrs_fr_flag: 'N',
      esrs_vsme_flag: 'N',
      esrs_vsme_fr_flag: 'N',
      gri_flag: 'N',
      gri_fr_flag: 'N',
      cal_lang_flag: 'N',
    }, name);

    req.session.message = {
      type: "success",
      message: "Register successfully. Please login to continue.",
    };

    // let dataChk =await db_Insert(table_name, fields, values, whr, flag);
    // if(dataChk.suc > 0){
    //  req.session.message = {
    //       type: "success",
    //       message: "Register successfully. Please login to continue.",
    //     };
    // }
    res.redirect("/register");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fireabase verification
UserRouter.post("/verify-token", async (req, res) => {
  const token = req.body.idToken;
  if (!token) return res.status(400).send('No token provided');

  try {
    const userInfo = await admin.auth().verifyIdToken(token);
    const whr = `user_id = '${userInfo.email}' AND active_flag = 'Y'`;
    const chk_dt = await db_Select("*", "md_user", whr, null);
    if (chk_dt.suc > 0 && chk_dt.msg.length > 0) {
      req.session.user = chk_dt.msg[0];
      return res.json({ success: true, user: chk_dt.msg[0] });
    } else {
      // MODIFIED BY VIKASH //
      let country = '';
      let policy = 'Y';
      let hashedPassword = await bcrypt.hashSync('123456', 10);
      // var table_name = "md_user",
      //   fields = `(user_name, user_id, password, user_type, country,created_dt)`,
      //   values = `('${userInfo.name}', '${userInfo.email}', '${hashedPassword}', 'C', '${userInfo.email.split("@")[1]}', '${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}')`,
      //   flag = 0;
      // await db_Insert(table_name, fields, values, null, flag);

      var res_dt = await saveClientData({
        client_name: userInfo.name,
        password: hashedPassword,
        user_name: userInfo.name,
        country: country,
        policy: policy,
        user_id: userInfo.email,
        platform_mode: 'E',
        plan_type: 'B',
        ai_tag_tool_flag: 'N',
        ghg_emi_flag: 'N',
        ifrs_flag: 'N',
        ifrs_fr_flag: 'N',
        esrs_flag: 'N',
        esrs_fr_flag: 'N',
        esrs_vsme_flag: 'N',
        esrs_vsme_fr_flag: 'N',
        gri_flag: 'N',
        gri_fr_flag: 'N',
        cal_lang_flag: 'N',
      }, userInfo.name);

      const whr = `user_id = '${userInfo.email}' AND active_flag = 'Y'`;
      const chk_dt = await db_Select("*", "md_user", whr, null);
      req.session.user = chk_dt.msg[0];
      return res.json({ success: true, user: chk_dt.msg[0] });
    }
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});


UserRouter.get("/login", (req, res) => {
  let user = req.session.user;
  if (user) {
    res.redirect("/dashboard");
  } else {
    res.render("pages/login");
  }
});

UserRouter.post("/login", async (req, res) => {
  var data = req.body;
  // MODIFIED BY VIKASH //
  var select =
    "id, client_id,stripe_customer_id, user_name, user_id, password, user_type, policy, active_flag, fast_login, login_dt",
    table_name = "md_user",
    whr = `user_id = '${data.email}' AND active_flag = 'Y'`,
    order = null;
  var chk_dt = await db_Select(select, table_name, whr, order);
  if (chk_dt.suc > 0) {
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
        // MODIFIED BY VIKASH //
        if (req.session.user.client_id && !await isMonthUser(data.email, req.session.user.client_id) && chk_dt.msg[0].user_type != "C" && chk_dt.msg[0].user_type != "S") {
          req.session.message = {
            type: "danger",
            message: "Subscription plan expired or contact with admin.",
          };
          delete req.session.user;
          return res.redirect("/login");
        }
        // END //
        if (chk_dt.msg[0].user_type != "S") {
          var select =
            "id, ai_tag_tool_flag, ghg_emi_flag, ifrs_flag, ifrs_fr_flag, esrs_flag, esrs_fr_flag, esrs_vsme_flag, esrs_vsme_fr_flag, gri_flag, gri_fr_flag, cal_lang_flag, platform_mode",
            table_name = "td_client",
            whr = `id = '${chk_dt.msg[0].client_id}'`,
            order = null;
          var client_dt = await db_Select(select, table_name, whr, order);
          req.session.user['platform_mode'] = client_dt.suc > 0 ? (client_dt.msg.length > 0 ? client_dt.msg[0].platform_mode : 'E') : 'E'
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
      fields = `${type == "I" ? `login_dt = '${curr_dt}'` : `logout_dt = '${curr_dt}'`
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
      "id,stripe_customer_id, client_id, user_name, user_id, password, user_type, active_flag",
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
          // console.log(otp);
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
    plat_mode: PLATFORM_MODE,
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

// MODOFIED BY VIKASH //
function canAddNewUser(subs, count) {
  if (subs != null) {
    const now = new Date();
    const purchaseDate = new Date(subs.purchase_date);
    const expireDate = new Date(subs.expires_date);
    if (!(now >= purchaseDate && now <= expireDate)) return false;

    // plan rules
    if (subs.product_name === 'Lite' && count <= 2) return true;
    if (subs.product_name === 'Premium') return true;
    if (!subs || subs.status === 'cancelled') return false;
  }
  return false;
}
// END //

UserRouter.get("/manage_user", async (req, res) => {
  // MODOFIED BY VIKASH //
  var chk_dt = await db_Select(
    "*",
    "stripe_subscriptions",
    `user_id = ${req.session.user?.id}`,
    `order by created_at desc limit 1`,
  );


  var user_count = await db_Select(
    "COUNT(*) AS cnt",
    "md_user",
    `client_id = ${req.session?.user.client_id}`,
    null
  );
  // END //
  var user_data = await getUserList(0, req.session.user.client_id);

  // MODOFIED BY VIKASH //
  var isMonthlyUser = await getMonthlyUser(req.session?.user.client_id);
  isMonthlyUser = isMonthlyUser.msg.map((item) => item.id);

  user_data = user_data.msg.map((row) => ({
    ...row,
    checked: isMonthlyUser.includes(row.id),
  }));

  if (isMonthlyUser.length > 0) {
    user_data.sort((a, b) => (a.user_type > b.user_type ? 1 : -1));
  }
  // END //
  // console.log(user_data);
  var data = {
    user_data,
    user_type_list: USER_TYPE_LIST,
    header: "Manage User",
    // MODOFIED BY VIKASH //
    subs: chk_dt.msg.length > 0 ? chk_dt.msg[0] : null,
    count: user_count.suc > 0 ? user_count.msg[0].cnt : 0,
    canAddNewUser: canAddNewUser,
    // END //
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

UserRouter.get('/deactive_client', async (req, res) => {
  var data = req.query
  // console.log(data,'ooo');
  var table_name = "td_client",
    fields = `active_flag = 'N'`,
    values = null,
    whr = `id = ${data.id}`,
    flag = 1;
  var dt = await db_Insert(table_name, fields, values, whr, flag)

  if (dt.suc > 0 && dt.msg.length > 0) {
    var table_name = "md_user",
      fields = `active_flag = 'N'`,
      values = null,
      whr = `client_id = ${data.id}`,
      flag = 1;
    var client_dt = await db_Insert(table_name, fields, values, whr, flag)
  }
  res.redirect(`/client`);
})

// MODOFIED BY VIKASH //
UserRouter.get('/profile-security', async (req, res) => {
  var data = {
    header: "Profile & Security",
    name: req.session.user.user_name,
    email: req.session.user.user_id,
  };
  res.render("pages/profile_security", data);
});

UserRouter.post('/profile-security', async (req, res) => {
  const { name, email, current_password, password, confirm_password } = req.body;

  if (!name || !email || !current_password || !confirm_password) {
    req.session.message = { type: "danger", message: "All fields are required" };
    return res.redirect(`/profile-security`);
  }

  try {
    // Fetch current user data
    var table_name = "md_user";
    var whr = `id = ${req.session.user.id}`;
    var chk_dt = await db_Select("*", table_name, whr, null);

    if (chk_dt.suc > 0 && chk_dt.msg.length > 0) {
      const user = chk_dt.msg[0];
      // Check current password
      const match = await bcrypt.compare(current_password, user.password);
      if (!match) {
        req.session.message = {
          type: "danger",
          message: "Current password is incorrect.",
        };
        return res.redirect(`/profile-security`);
      }
      // Check new password and confirm password match
      if (password !== confirm_password) {
        req.session.message = {
          type: "danger",
          message: "New password and confirm password do not match.",
        };
        return res.redirect(`/profile-security`);
      }
      // Update password and name
      let hashedPassword = await bcrypt.hash(password, 10);
      var fields = `user_name = '${name}', password = '${hashedPassword}'`;
      var flag = 1;
      await db_Insert(table_name, fields, null, whr, flag);
      req.session.message = {
        type: "success",
        message: "Profile updated successfully.",
      };
      return res.redirect(`/profile-security`);
    } else {
      req.session.message = {
        type: "danger",
        message: "User not found.",
      };
      return res.redirect(`/profile-security`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


UserRouter.get('/message-settings', async (req, res) => {
  var data = {
    header: "Message Settings",
    policy: req.session.user.policy
  };
  return res.render("pages/message-settings", data);
});


UserRouter.get('/faq', async (req, res) => {
  var data = {
    header: "FAQs",
    policy: req.session.user.user_id
  };
  return res.render("pages/faq", data);
});


UserRouter.get('/knowledgebase', async (req, res) => {
  var data = {
    header: "Knowledgebase",
    policy: req.session.user.user_id
  };
  return res.render("pages/knowledgebase", data);
});
// END //

module.exports = { UserRouter };
