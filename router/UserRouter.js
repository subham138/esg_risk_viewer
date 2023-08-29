const express = require("express"),
  UserRouter = express.Router(),
  bcrypt = require("bcrypt");

const { db_Select } = require("../modules/MasterModule");

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
  // dynamicNotify('fa fa-bell-o', 'Success', 'Test notification', 'success')
  var select = "id, user_name, user_id, password, user_type",
    table_name = "md_user",
    whr = `user_id = '${data.email}' AND active_flag = 'Y'`,
    order = null;
  var chk_dt = await db_Select(select, table_name, whr, order);
  if (chk_dt.suc > 0) {
    // console.log(await bcrypt.compare(data.password, chk_dt.msg[0].password));
    if (chk_dt.msg.length > 0) {
      if (await bcrypt.compare(data.password, chk_dt.msg[0].password)) {
        req.session.user = chk_dt.msg[0];
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

module.exports = { UserRouter };
