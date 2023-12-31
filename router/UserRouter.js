const express = require("express"),
  UserRouter = express.Router(),
  bcrypt = require("bcrypt");

const { db_Select, USER_TYPE_LIST } = require("../modules/MasterModule");
const {
  getUserList,
  saveUser,
  getClientList,
  saveClientData,
} = require("../modules/UserModule");

UserRouter.use((req, res, next) => {
  // console.log(req.url);
  if (req.url != "/login") {
    var user = req.session.user;
    if (user) {
      next();
    } else {
      res.redirect("/login");
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
  var select = "id, client_id, user_name, user_id, password, user_type, active_flag",
    table_name = "md_user",
    whr = `user_id = '${data.email}' AND active_flag = 'Y'`,
    order = null;
  var chk_dt = await db_Select(select, table_name, whr, order);
  if (chk_dt.suc > 0) {
    // console.log(await bcrypt.compare(data.password, chk_dt.msg[0].password));
    if (chk_dt.msg.length > 0) {
      if (await bcrypt.compare(data.password, chk_dt.msg[0].password)) {
        req.session.user = chk_dt.msg[0];
        if(chk_dt.msg[0].user_type != 'S'){
          var select = "id, ai_tag_tool_flag, ghg_emi_flag, ifrs_flag, esrs_flag, gri_flag, gri_fr_flag",
            table_name = "td_client",
            whr = `id = '${chk_dt.msg[0].client_id}'`,
            order = null;
          var client_dt = await db_Select(select, table_name, whr, order);
          req.session.user['ai_tag_tool_flag'] = client_dt.suc > 0 ? (client_dt.msg.length > 0 ? client_dt.msg[0].ai_tag_tool_flag : 'N') : 'N';
          req.session.user['ghg_emi_flag'] = client_dt.suc > 0 ? (client_dt.msg.length > 0 ? client_dt.msg[0].ghg_emi_flag : 'N') : 'N';
          req.session.user['ifrs_flag'] = client_dt.suc > 0 ? (client_dt.msg.length > 0 ? client_dt.msg[0].ifrs_flag : 'N') : 'N';
          req.session.user['esrs_flag'] = client_dt.suc > 0 ? (client_dt.msg.length > 0 ? client_dt.msg[0].esrs_flag : 'N') : 'N';
          req.session.user['gri_flag'] = client_dt.suc > 0 ? (client_dt.msg.length > 0 ? client_dt.msg[0].gri_flag : 'N') : 'N';
          req.session.user['gri_fr_flag'] = client_dt.suc > 0 ? (client_dt.msg.length > 0 ? client_dt.msg[0].gri_fr_flag : 'N') : 'N';
        }
        req.session.videoPopUp = true;
        res.redirect("/dashboard");
      } else {
        req.session.message = {
          type: "warning",
          message: "Please check your user-id or password",
        };
        res.redirect("/login");
      }
    } else {
      req.session.message = { type: "warning", message: "UserId not exist" };
      res.redirect("/login");
    }
  } else {
    req.session.message = { type: "danger", message: chk_dt.msg };
    res.redirect("/login");
  }
  // res.send(data)
});

UserRouter.get("/log_out", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
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
    user_type_list: USER_TYPE_LIST,
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

module.exports = { UserRouter };
