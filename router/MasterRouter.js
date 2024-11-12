const express = require("express"),
  MasterRouter = express.Router(),
  dateFormat = require("dateformat");

const {
  getSectorList,
  getIndustriesList,
  getTopicCatgList,
  getTopicList,
  getBusiActList,
} = require("../modules/AdminModule");
const { db_Insert, db_Select, db_Check, db_Delete } = require("../modules/MasterModule");

MasterRouter.use((req, res, next) => {
  var user = req.session.user;
    if (user) {
        next();
    } else {
        res.redirect("/login");
    }
})

MasterRouter.get("/sector", async (req, res) => {
  var enc_dt = req.query.flag,
  flag = new Buffer.from(enc_dt, 'base64').toString();

  var data = await getSectorList(0, flag);
  // console.log(data);
  res.render("master/sector/view", { data, flag, enc_dt });
});

MasterRouter.get("/sec_edit", async (req, res) => {
  var id = req.query.id,
    enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, 'base64').toString(),
    data;
  if (id > 0) {
    data = await getSectorList(id, flag);
  }
  // console.log(id);
  res.render("master/sector/add", { data, sec_id: id, flag, enc_dt });
});

MasterRouter.post("/sec_save", async (req, res) => {
  var data = req.body;
  var table_name = "md_sector",
    fields = data.id > 0 ? `sec_name = "${data.sec_name}"` : "(repo_flag, sec_name)",
    values = `('${data.flag}', "${data.sec_name}")`,
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag);
  if (res_dt.suc > 0) {
    req.session.message = {
      type: "success",
      message: "Saved successfully",
    };
    res.redirect(`/sector?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  } else {
    req.session.message = { type: "danger", message: "Data not saved" };
    res.redirect(data.id > 0 ? `/sector?id=${data.id}&flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}` : `/sector?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  }
});

MasterRouter.get("/sec_delete", async (req, res) => {
  var id = req.query.id, res_dt, flag = req.query.flag;
  if (id > 0) {
    res_dt = await db_Delete('md_sector', `id = ${id}`);
    req.session.message = { type: "danger", message: "Data deleted successfully" };
  }else{
    req.session.message = { type: "danger", message: "Data not saved" };
  }
  res.redirect(`/sector?flag=${flag}`);
});

MasterRouter.get("/industries", async (req, res) => {
  var enc_dt = req.query.flag,
  flag = new Buffer.from(enc_dt, 'base64').toString();

  var data = await getIndustriesList(0, 0, flag);
  // console.log(data);
  res.render("master/industries/view", { data, enc_dt });
});

MasterRouter.get("/ind_edit", async (req, res) => {
  var id = req.query.id,
    enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, 'base64').toString(),
    ind_data = [],
    sec_data = await getSectorList(0, flag);
  var topic_catg = await getTopicCatgList(0, flag),
    topic = {};
  for (let dt of topic_catg.msg) {
    topic[dt.catg_name] = await getTopicList(0, dt.id, flag);
  }
  if (id > 0) {
    ind_data = await getIndustriesList(id, 0, flag);
    // console.log(ind_data);
  }
  res.render("master/industries/add", {
    ind_data,
    sec_data,
    ind_id: id,
    topic,
    topic_catg,
    flag,
    enc_dt
  });
});

MasterRouter.post("/ind_save", async (req, res) => {
  var data = req.body;
  var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  var table_name = "md_industries",
    fields =
      data.id > 0
        ? `sec_id = '${data.sec_id}', ind_name = '${data.ind_name}'`
        : "(repo_flag, sec_id, ind_name)",
    values = `('${data.flag}', '${data.sec_id}', '${data.ind_name}')`,
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0;
  // console.log(data);
  var res_dt = await db_Insert(table_name, fields, values, whr, flag);
  if(data.top_id)
  if (Array.isArray(data.top_id)) {
    // console.log(`(${data.top_id.join(',')})`);
    try{
      var table_name = "md_industries_topics",
        whr = `repo_flag = '${data.flag}' AND ind_id = ${data.id > 0 ? data.id : res_dt.lastId.insertId} AND topic_id NOT IN(${data.top_id.length > 1 ? data.top_id.join(',') : data.top_id[0]})`;
        var top_delete = await db_Delete(table_name, whr)
    }catch(err){
      console.log(err);
    }
    for (let dt of data.top_id) {
      try{
        var chk_dt = await db_Check(
          "id",
          "md_industries_topics",
          `repo_flag = '${data.flag}' AND topic_id = ${dt} AND ind_id = ${
            data.id > 0 ? data.id : res_dt.lastId.insertId
          }`
        );
        if (chk_dt.suc > 0 && chk_dt.msg == 0) {
          var table_name = "md_industries_topics",
            fields = "(repo_flag, ind_id, topic_id, topic_flag, created_by, created_dt)",
            values = `('${data.flag}', '${data.id}', '${dt}', 'Y', 'admin', '${datetime}')`,
            whr = null,
            flag = 0;
          var ind_topic = await db_Insert(table_name, fields, values, whr, flag);
        }
      }catch(err){
        console.log(err);
      }
      //   console.log(chk_dt);
    }
  }else{
    try{
      var table_name = "md_industries_topics",
        whr = `repo_flag = '${data.flag}' AND ind_id = ${data.id > 0 ? data.id : res_dt.lastId.insertId} AND topic_id NOT IN(${data.top_id})`;
        var top_delete = await db_Delete(table_name, whr)
    }catch(err){
      console.log(err);
    }
    try{
      var chk_dt = await db_Check(
        "id",
        "md_industries_topics",
        `repo_flag = '${data.flag}' AND topic_id = ${data.top_id} AND ind_id = ${
          data.id > 0 ? data.id : res_dt.lastId.insertId
        }`
      );
      if (chk_dt.suc > 0 && chk_dt.msg == 0) {
        var table_name = "md_industries_topics",
          fields = "(repo_flag, ind_id, topic_id, topic_flag, created_by, created_dt)",
          values = `('${data.flag}', '${data.id}', '${data.top_id}', 'Y', 'admin', '${datetime}')`,
          whr = null,
          flag = 0;
        var ind_topic = await db_Insert(table_name, fields, values, whr, flag);
      }
    }catch(err){
      console.log(err);
    }
  }

  if (res_dt.suc > 0) {
    req.session.message = {
      type: "success",
      message: "Saved successfully",
    };
    res.redirect(`/industries?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  } else {
    req.session.message = { type: "danger", message: "Data not saved" };
    res.redirect(data.id > 0 ? `/industries?id=${data.id}&flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}` : `/industries?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  }
});

MasterRouter.get("/ind_del", async (req, res) => {
  var id = req.query.id, res_dt, flag = req.query.flag;
  if (id > 0) {
    res_dt = await db_Delete('md_industries', `id = ${id}`);
    if(res_dt.suc > 0){
      await db_Delete('md_industries_topics', `ind_id = ${id}`);
    }
    req.session.message = { type: "danger", message: "Data deleted successfully" };
  }else{
    req.session.message = { type: "danger", message: "Data not saved" };
  }
  res.redirect(`/industries?flag=${flag}`);
});

MasterRouter.get("/topic_catg", async (req, res) => {
  var enc_dt = req.query.flag,
  flag = new Buffer.from(enc_dt, 'base64').toString();

  var data = await getTopicCatgList(0, flag);
  // console.log(data);
  res.render("master/topic_catg/view", { data, enc_dt });
});

MasterRouter.get("/topic_catg_edit", async (req, res) => {
  var id = req.query.id,
    enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, 'base64').toString(),
    data;
  if (id > 0) {
    data = await getTopicCatgList(id, flag);
  }
  // console.log(id);
  res.render("master/topic_catg/add", { data, id: id, flag, enc_dt });
});

MasterRouter.post("/topic_catg_save", async (req, res) => {
  var data = req.body;
  var table_name = "md_topic_catg",
    fields = data.id > 0 ? `catg_name = "${data.catg_name}"` : "(repo_flag, catg_name)",
    values = `('${data.flag}', "${data.catg_name}")`,
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag);
  if (res_dt.suc > 0) {
    req.session.message = {
      type: "success",
      message: "Saved successfully",
    };
    res.redirect(`/topic_catg?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  } else {
    req.session.message = { type: "danger", message: "Data not saved" };
    res.redirect(data.id > 0 ? `/topic_catg?id=${data.id}&flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}` : `/topic_catg?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  }
});

MasterRouter.get("/topic_catg_del", async (req, res) => {
  var id = req.query.id,
    res_dt, flag = req.query.flag;
  if (id > 0) {
    res_dt = await db_Delete('md_topic_catg', `id = ${id}`);
    req.session.message = { type: "danger", message: "Data deleted successfully" };
  }else{
    req.session.message = { type: "danger", message: "Data not saved" };
  }
  res.redirect(`/topic_catg?flag=${flag}`);
});

MasterRouter.get("/topic", async (req, res) => {
  var enc_dt = req.query.flag,
  flag = new Buffer.from(enc_dt, 'base64').toString();

  var data = await getTopicList(0, 0, flag);
  // console.log(data);
  res.render("master/topic/view", { data, enc_dt });
});

MasterRouter.get("/topic_edit", async (req, res) => {
  var id = req.query.id,
    enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, 'base64').toString(),
    topic_data,
    catg_data = await getTopicCatgList(0, flag);
  if (id > 0) {
    topic_data = await getTopicList(id, 0, flag);
  }
  res.render("master/topic/add", { topic_data, catg_data, id: id, flag, enc_dt });
});

MasterRouter.post("/topic_save", async (req, res) => {
  var data = req.body;
  var table_name = "md_topic",
    fields =
      data.id > 0
        ? `topic_catg_id = '${data.topic_catg_id}', topic_name = "${data.topic_name}"`
        : "(repo_flag, topic_catg_id, topic_name)",
    values = `('${data.flag}', '${data.topic_catg_id}', "${data.topic_name}")`,
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag);
  if (res_dt.suc > 0) {
    req.session.message = {
      type: "success",
      message: "Saved successfully",
    };
    res.redirect(`/topic?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  } else {
    req.session.message = { type: "danger", message: "Data not saved" };
    res.redirect(data.id > 0 ? `/topic_edit?id=${data.id}&flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}` : `/topic?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  }
});

MasterRouter.get("/topic_del", async (req, res) => {
  var id = req.query.id,
  data= req.query,
    res_dt;
  if (id > 0) {
    res_dt = await db_Delete('md_topic', `id = ${id}`);
    req.session.message = { type: "danger", message: "Data deleted successfully" };
  }else{
    req.session.message = { type: "danger", message: "Data not deleted" };
  }
  res.redirect(`/topic?flag=${encodeURIComponent(data.flag)}`);
});

MasterRouter.get("/busi_act", async (req, res) => {
  var enc_dt = req.query.flag,
  flag = new Buffer.from(enc_dt, 'base64').toString();

  var data = await getBusiActList(0, 0, 0, flag);
  // console.log(data);
  res.render("master/busi_act/view", {
    data,
    header: "Business Activities (NACE)",
    enc_dt
  });
});

MasterRouter.get("/get_ind_list_ajax", async (req, res) => {
  var data = req.query;
  var ind_data = await getIndustriesList(data.ind_id > 0 ? data.ind_id : null, data.sec_id, data.flag);
  res.send(ind_data);
});

MasterRouter.get("/busi_act_edit", async (req, res) => {
  var id = req.query.id,
    enc_dt = req.query.flag,
    flag = new Buffer.from(enc_dt, 'base64').toString(),
    sec_data = await getSectorList(0, flag),
    ind_data = {suc:0, msg:[]},
    busi_data;
  if (id > 0) {
    busi_data = await getBusiActList(id, 0, 0, flag);
    ind_data = await getIndustriesList(
      0,
      busi_data.suc > 0 ? busi_data.msg[0].sec_id : 0,
      flag
    );
  }
  // console.log(ind_data);
  var data = {
    sec_data,
    ind_data,
    busi_data,
    header: "Business Activities (NACE)",
    sub_header: "Add/Edit Business Activities (NACE)",
    header_url: `/busi_act?flag=${enc_dt}`,
    flag,
    id: id,
  };
  res.render("master/busi_act/add", data);
});

MasterRouter.post("/busi_act_save", async (req, res) => {
  var data = req.body;
  var table_name = "md_busi_act",
    fields =
      data.id > 0
        ? `sec_id = '${data.sec_id}', ind_id = '${data.ind_id}', busi_act_name = '${data.busi_act_name}'`
        : "(repo_flag, sec_id, ind_id, busi_act_name)",
    values = `('${data.flag}', '${data.sec_id}', '${data.ind_id}', '${data.busi_act_name}')`,
    whr = data.id > 0 ? `id = ${data.id}` : null,
    flag = data.id > 0 ? 1 : 0;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag);
  if (res_dt.suc > 0) {
    req.session.message = {
      type: "success",
      message: "Saved successfully",
    };
    res.redirect(`/busi_act?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  } else {
    req.session.message = { type: "danger", message: "Data not saved" };
    res.redirect(data.id > 0 ? `/busi_act_edit?id=${data.id}&flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}` : `/busi_act?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
  }
});

MasterRouter.get('/get_busi_act_ajax', async (req, res) => {
  var data = req.query
  var res_dt = await getBusiActList(0, data.sec_id, data.ind_id, data.flag)
  res.send(res_dt)
})

MasterRouter.get("/busi_act_del", async (req, res) => {
  var id = req.query.id,
  data= req.query,
    res_dt;
  if (id > 0) {
    res_dt = await db_Delete('md_busi_act', `id = ${id}`);
    req.session.message = { type: "danger", message: "Data deleted successfully" };
  }else{
    req.session.message = { type: "danger", message: "Data not saved" };
  }
  res.redirect(`/busi_act?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`);
});

MasterRouter.get('/met_note', async (req, res) => {
  var enc_dt = req.query.flag,
  flag = new Buffer.from(enc_dt, 'base64').toString();
  var data = await db_Select('*', 'md_met_note', `flag='${flag}'`, null)
  // console.log(data);
  res.render("master/met_note", {
    data: data.suc > 0 ? data.msg : [],
    header: "Notes",
    flag,
    enc_dt
  });
})

MasterRouter.post('/met_note', async (req, res) => {
  var data = req.body,
  user_name = req.session.user.user_name,
  datetime = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
  var table_name = 'md_met_note', 
  fields = data.id > 0 ? `met_note = '${data.met_note != '' ? data.met_note.split("'").join("\\'") : ""}', modified_by = '${user_name}', modified_dt = '${datetime}'` : '(flag, met_note, created_by, created_dt)', 
  values = `('${data.flag}', '${data.met_note != '' ? data.met_note.split("'").join("\\'") : ""}', '${user_name}', '${datetime}')`, 
  whr = data.id > 0 ? `id = ${data.id}` : null, 
  flag = data.id > 0 ? 1 : 0;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag)
  if (res_dt.suc > 0) {
    req.session.message = { type: "success", message: "Saved successfully" };
  }else{
    req.session.message = { type: "danger", message: "Data not saved" };
  }
  res.redirect(`/met_note?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`)
})


module.exports = { MasterRouter };
