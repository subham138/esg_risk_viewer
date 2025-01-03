const {
  getSectorList,
  getIndustriesList,
  getBusiActList,
  getMetNote,
} = require("../modules/AdminModule");
const {
  getCalTypeList,
  getCalUnitList,
} = require("../modules/CalculatorModule");
const {
  getDynamicData,
  getSusDiscList,
  getActMetrialDtls,
  getRiskOprnDtls,
} = require("../modules/DataCollectionModule");
const {
  db_Insert,
  db_Delete,
  USER_TYPE_LIST,
  PROJECT_LIST,
  db_Select,
} = require("../modules/MasterModule");
const {
  getProjectList,
  saveProject,
  getLocationList,
  saveProjectArticle,
  getSavedProjectWork,
  saveGhgEmi,
  getGhgEmiList,
  getActiveTopicList,
  saveCheckedProjectFlag,
  getCheckedProjectTopList,
  getSusDistPointDt,
} = require("../modules/ProjectModule");
const { getUserList } = require("../modules/UserModule");
const dateFormat = require("dateformat");

const { my_project: en_lang } = require("../assets/language/en.json");
const { my_project: fr_lang } = require("../assets/language/fr.json");

const express = require("express"),
  ProjectRouter = express.Router(),
  puppeteer = require("puppeteer"),
  fs = require("fs"),
  path = require("path"),
  eng_flag = ["I", "E", "G", "EV"];

// ProjectRouter.use((req, res, next) => {
//     var user = req.session.user;
//     if (user) {
//         next();
//     } else {
//         res.redirect("/login");
//     }
// })

ProjectRouter.get("/my_project", async (req, res) => {
  var enc_dt = req.query.flag,
    dec_flag = new Buffer.from(enc_dt, "base64").toString();
  var flag = dec_flag == "IC" ? "I" : (dec_flag == "FC" ? 'F' : dec_flag);
  // console.log(flag, dec_flag, "flag");
    

  // var req_data = req.query
  var user_type = req.session.user.user_type,
    user_id = req.session.user.user_id;
  var lang = eng_flag.includes(flag) ? en_lang : fr_lang;

  var project_data = await getProjectList(
    0,
    req.session.user.client_id,
    user_type != "A" && user_type != "C" && user_type != "S" ? user_id : 0,
    flag,
    dec_flag == "IC" || dec_flag == "FC" ? "C" : req.session.user.platform_mode
  );
  // console.log(project_data);
  
  var data = {
    lang: lang,
    user_type,
    project_data,
    header: lang.header, //"Project List",
    enc_dt,
    flag,
    dec_flag,
    dateFormat,
    flag_name: PROJECT_LIST[dec_flag],
  };
  res.render("projects/view", data);
});

ProjectRouter.get("/my_project_add", async (req, res) => {
  var enc_dt = req.query.flag,
    // flag = new Buffer.from(enc_dt, "base64").toString();
    dec_flag = new Buffer.from(enc_dt, "base64").toString();
  var flag = dec_flag == "IC" ? "I" : (dec_flag == "FC" ? 'F' : dec_flag);

  var lang = eng_flag.includes(flag) ? en_lang : fr_lang;

  var id = req.query.id,
    project_data = [];
  var user_list = await getUserList(0, req.session.user.client_id);
  if (id > 0) {
    project_data = await getProjectList(
      id,
      req.session.user.client_id,
      0,
      flag,
      dec_flag == "IC" || dec_flag == "FC" ? "C" : req.session.user.platform_mode
    );
  }

  var loc_list = await getLocationList(),
    sec_data = await getSectorList(0, flag),
    ind_data = [],
    act_list = [];
  // console.log(project_data);
  var data = {
    lang: lang,
    user_list,
    id,
    proj_id: req.query.id,
    project_data:
      project_data.suc > 0 && project_data.msg.length > 0
        ? project_data.msg[0]
        : [],
    loc_list,
    sec_data,
    ind_data,
    act_list,
    header: lang.add.header,
    sub_header: lang.add.sub_header,
    header_url: `/my_project?flag=${enc_dt}`,
    flag,
    dec_flag,
    flag_name: PROJECT_LIST[flag],
    enc_flag: enc_dt,
  };
  res.render("projects/add", data);
});

ProjectRouter.post("/my_project_save", async (req, res) => {
  var data = req.body;
  var res_dt = await saveProject(
    data,
    req.session.user.client_id,
    req.session.user.user_name,
    data.dec_flag == 'IC' || data.dec_flag == "FC" ? 'C' : req.session.user.platform_mode
  );
  req.session.message = {
    type: res_dt.suc > 0 ? "success" : "danger",
    message: res_dt.msg,
  };
  // res.redirect(`/my_project?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`)
  res.redirect(
    `/my_project_add?id=${res_dt.project_id}&flag=${encodeURIComponent(
      new Buffer.from(data.flag).toString("base64")
    )}`
  );
});

ProjectRouter.post("/my_project_save_ajax", async (req, res) => {
  var data = req.body;
  // console.log(data);
  var res_dt = await saveProject(
    data,
    req.session.user.client_id,
    req.session.user.user_name,
    data.dec_flag == 'IC' || data.dec_flag == "FC" ? 'C' : req.session.user.platform_mode
  );
  // req.session.message = {
  //     type: res_dt.suc > 0 ? "success" : "danger",
  //     message: res_dt.msg,
  // };
  res.send(res_dt);
  // res.redirect(`/my_project_add?id=${res_dt.project_id}&flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`)
});

ProjectRouter.post("/delete_my_project", async (req, res) => {
  var data = req.body;
  var res_dt = await db_Delete("td_user_project", `id=${data.id}`);
  res.send(res_dt);
});

ProjectRouter.get("/proj_work", async (req, res) => {
  var enc_dt = req.query.flag,
    // flag = new Buffer.from(enc_dt, "base64").toString();
    dec_flag = new Buffer.from(enc_dt, "base64").toString();
  var flag = dec_flag == "IC" ? "I" : (dec_flag == "FC" ? 'F' : dec_flag);

  var lang = eng_flag.includes(flag) ? en_lang : fr_lang;

  var loc_list = await getLocationList(),
    sec_data = await getSectorList(0, flag),
    ind_data = [],
    act_list = [];
  var project_data = await getProjectList(
    req.query.id,
    req.session.user.client_id,
    0,
    flag,
    dec_flag == 'IC' || dec_flag == "FC" ? 'C' : req.session.user.platform_mode
  );
  var data = {
    lang: lang,
    id: 0,
    proj_id: req.query.id,
    proj_name:
      project_data.suc > 0 && project_data.msg.length > 0
        ? project_data.msg[0].project_name
        : "",
    project_data:
      project_data.suc > 0 && project_data.msg.length > 0
        ? project_data.msg[0]
        : false,
    loc_list,
    sec_data,
    ind_data,
    act_list,
    header: lang.manage.header,
    sub_header: lang.manage.sub_header,
    header_url: `/my_project?flag=${enc_dt}`,
    flag,
    dec_flag,
    flag_name: PROJECT_LIST[flag],
  };
  res.render("project_work/add", data);
});

ProjectRouter.post("/save_proj_work", async (req, res) => {
  var data = req.body,
    busi_data = await getBusiActList(0, data.sec_id, data.ind_id, data.flag),
    busi_name = [],
    location_data = await getLocationList(),
    location_name = [],
    bus_id_list = "",
    user_id = req.session.user.user_id,
    user_name = req.session.user.user_name,
    datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

  if (Array.isArray(data.bus_id)) {
    for (let dt of data.bus_id) {
      var indx =
        busi_data.suc > 0 && busi_data.msg.length > 0
          ? busi_data.msg.findIndex((idt) => idt.id == dt)
          : -1;
      if (indx >= 0) {
        busi_name.push(busi_data.msg[indx]);
      }
    }
    busi_name = [...busi_name.map((dt) => dt.busi_act_name)];
    busi_name = busi_name.join(",");
    bus_id_list = data.bus_id.join(",");
    // console.log(busi_name);
  } else {
    var indx =
      busi_data.suc > 0 && busi_data.msg.length > 0
        ? busi_data.msg.findIndex((idt) => idt.id == data.bus_id)
        : -1;
    if (indx >= 0) {
      busi_name.push(busi_data.msg[indx]);
    }
    busi_name = Array.isArray(busi_name)
      ? busi_name.length > 0
        ? busi_name[0].busi_act_name
        : ""
      : busi_name.busi_act_name
      ? busi_name.busi_act_name
      : "";
    bus_id_list = data.bus_id;
  }

  if (Array.isArray(data.location_id)) {
    for (let dt of data.location_id) {
      var indx =
        location_data.suc > 0 && location_data.msg.length > 0
          ? location_data.msg.findIndex((idt) => idt.id == dt)
          : -1;
      if (indx >= 0) {
        location_name.push(location_data.msg[indx]);
      }
    }
    location_name = [...location_name.map((dt) => dt.location_name)];
    location_name = location_name.join(",");
  } else {
    var indx =
      location_data.suc > 0 && location_data.msg.length > 0
        ? location_data.msg.findIndex((idt) => idt.id == data.location_id)
        : -1;
    if (indx >= 0) {
      location_name.push(location_data.msg[indx]);
    }
    location_name = Array.isArray(location_name)
      ? location_name.length > 0
        ? location_name[0].location_name
        : ""
      : location_name.location_name
      ? location_name.location_name
      : "";
  }
  var table_name = "td_project",
    fields = `last_access = '${datetime}', last_accessed_by = '${user_name}', sec_id = '${data.sec_id}', ind_id = '${data.ind_id}', bus_act_id = '${bus_id_list}', business_act = "${busi_name}", location_busi_act = "${location_name}", modified_by = "${user_name}", modified_dt = "${datetime}"`,
    values = null,
    whr = `id = ${data.proj_id}`,
    flag = 1;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag);
  if (res_dt.suc > 0) {
    req.session.message = {
      type: "success",
      message: "Saved successfully",
    };
    // res.redirect(`/proj_work_view?dt=${Buffer.from(JSON.stringify({proj_id: data.proj_id, sec_id: data.sec_id, ind_id: data.ind_id, flag: data.flag}), "utf8").toString('base64')}`);
    // res.redirect(
    //   `/project_report_view?enc_data=${Buffer.from(
    //     JSON.stringify({
    //       sec_id: data.sec_id,
    //       ind_id: data.ind_id,
    //       top_id: 0,
    //       proj_id: data.proj_id,
    //       proj_name: data.proj_name,
    //       repo_type: data.flag == "I" ? "ifrs" : (data.flag == "E" ? "esrs" : (data.flag == "G" ? "gri" : "gri-f")),
    //       flag: data.flag,
    //     }),
    //     "utf8"
    //   ).toString("base64")}`
    // );
    res.redirect(
      `/my_project?flag=${encodeURIComponent(
        new Buffer.from(data.dec_flag).toString("base64")
      )}`
    );
  } else {
    req.session.message = { type: "danger", message: "Data not saved" };
    res.redirect(
      `/proj_work?id=${data.proj_id}&flag=${encodeURIComponent(
        new Buffer.from(data.flag).toString("base64")
      )}`
    );
  }
});

ProjectRouter.get("/proj_work_view", async (req, res) => {
  var enc_data = req.query.dt,
    data = Buffer.from(enc_data, "base64");
  data = JSON.parse(data);

  var lang = eng_flag.includes(data.flag) ? en_lang : fr_lang;

  var sec_data = await getSectorList(data.sec_id, data.flag),
    ind_data = await getIndustriesList(data.ind_id, 0, data.flag),
    project_data = await getProjectList(
      data.proj_id,
      req.session.user.client_id,
      0,
      data.flag,
      req.session.user.platform_mode
    );
  // console.log(project_data);

  project_data =
    project_data.suc > 0 && project_data.msg.length > 0
      ? project_data.msg[0]
      : null;

  // console.log(ind_data);

  var res_data = {
    sec_name:
      sec_data.suc > 0 && sec_data.msg.length > 0 ? sec_data.msg[0] : null,
    ind_name:
      ind_data.suc > 0 && ind_data.msg.length > 0 ? ind_data.msg[0] : null,
    busi_name: project_data ? project_data.business_act : "",
    location_name: project_data ? project_data.location_busi_act : "",
    proj_id: data.proj_id,
    proj_name: project_data ? project_data.project_name : "",
    user_type: req.session.user.user_type,
    header: "Project Work",
    sub_header: "Project Add/Edit",
    header_url: `/my_project?flag=${encodeURIComponent(
      new Buffer.from(data.flag).toString("base64")
    )}`,
    flag: data.flag,
    enc_dt: encodeURIComponent(new Buffer.from(data.flag).toString("base64")),
  };
  res.render("project_work/add_view", res_data);
});

ProjectRouter.get("/project_report_view", async (req, res) => {
  var enc_data = req.query.enc_data,
    data_set = {};
  var data = Buffer.from(enc_data, "base64");
  data = JSON.parse(data);

  var lang = eng_flag.includes(data.flag) ? en_lang : fr_lang;

  var resDt = await getDynamicData(
    0,
    data.sec_id,
    data.ind_id,
    data.top_id,
    data.flag
  );
  var susDistList = await getSusDiscList(
    data.sec_id,
    data.ind_id,
    0,
    data.flag
  );
  var metric = await getActMetrialDtls(data.sec_id, data.ind_id, data.flag);
  var editorVal = await getSavedProjectWork(
    data.sec_id,
    data.ind_id,
    data.top_id,
    data.proj_id,
    data.flag
  );
  var topName =
    resDt.suc > 0 ? (resDt.msg.length > 0 ? resDt.msg[0].topic_name : "") : "";
  var allDynamicData = await getDynamicData(
    0,
    data.sec_id,
    data.ind_id,
    0,
    data.flag
  );
  // var type_list = await getCalTypeList(
  //     0,
  //     req.session.user.cal_lang_flag != "B"
  //       ? req.session.user.cal_lang_flag
  //       : "E"
  //   ),
  var type_list = { suc: 0, msg: [] },
    act_list = { suc: 0, msg: [] },
    emi_type = { suc: 0, msg: [] };
  var year_list = [],
    currDate = new Date();
  // var ghg_emi_list = await getGhgEmiList(
  //   req.session.user.client_id,
  //   0,
  //   data.proj_id
  // );
  var ghg_emi_list = { suc: 0, msg: [] }
  ghg_emi_list =
    ghg_emi_list.suc > 0
      ? ghg_emi_list.msg.length > 0
        ? ghg_emi_list.msg
        : []
      : [];
  var scope_list =
    ghg_emi_list.length > 0 ? ghg_emi_list.map((dt) => dt.scope) : [];
  scope_list = scope_list.length > 0 ? [...new Set(scope_list)] : [];
  var act_top_catg_list = await getActiveTopicList(data.ind_id, data.flag);
  var get_checked_top_list = await getCheckedProjectTopList(
    0,
    data.flag,
    data.proj_id
  );
  var project_data = await getProjectList(
    data.proj_id,
    req.session.user.client_id,
    0,
    data.flag,
    req.session.user.platform_mode
  );

  var risk_info_dt = await getRiskOprnDtls(data.flag, data.sec_id, data.ind_id);
  // console.log(risk_info_dt);
  // console.log(project_data);

  var ghg_emi_data = {};
  if (scope_list.length > 0) {
    for (let dt of scope_list) {
      ghg_emi_data[dt] = ghg_emi_list.filter((fdt) => fdt.scope == dt);
    }
  }
  // console.log(ghg_emi_data);
  // console.log(parseInt(currDate.getFullYear()));
  for (let i = 0; i <= 6; i++) {
    // console.log(i, 'Year');
    year_list.push(parseInt(currDate.getFullYear()) - i);
  }
  allDynamicData = allDynamicData.suc > 0 ? allDynamicData.msg : "";
  // console.log(resDt);
  if (resDt.suc > 0 && resDt.msg.length > 0) {
    if (resDt.msg.length == 1) {
      if (resDt.msg[0].data_file_name) {
        resDt = fs.readFileSync(
          path.join("dynamic_data_set", resDt.msg[0].data_file_name),
          "utf-8"
        );
        resDt = JSON.parse(resDt);
      }
    } else {
      for (let dt of resDt.msg) {
        if (dt.data_file_name != "") {
          var dynData = fs.readFileSync(
            path.join("dynamic_data_set", dt.data_file_name),
            "utf-8"
          );
          data_set[dt.top_id] = JSON.parse(dynData);
        }
      }
    }
  }
  // console.log(req.session.user.ai_tag_tool_flag, 'ai_tag_flag');
  var res_data = {
    lang: lang,
    top_id: data.top_id,
    topName,
    sec_id: data.sec_id,
    ind_id: data.ind_id,
    project_id: data.proj_id,
    projName: data.proj_name,
    repo_type: data.repo_type,
    resDt,
    susDistList,
    metric,
    user_type: req.session.user.user_type,
    ai_tag_tool_flag: req.session.user.ai_tag_tool_flag,
    editorData:
      editorVal.suc > 0 && editorVal.msg.length > 0 ? editorVal.msg : [],
    data_set,
    allDynamicData,
    type_list: type_list.suc > 0 ? type_list.msg : [],
    act_list: act_list.suc > 0 ? act_list.msg : [],
    emi_type: emi_type.suc > 0 ? emi_type.msg : [],
    ghg_emi_data,
    year_list,
    act_top_catg_list: act_top_catg_list.suc > 0 ? act_top_catg_list.msg : [],
    get_checked_top_list:
      get_checked_top_list.suc > 0 ? get_checked_top_list.msg : [],
    project_data: project_data.suc > 0 ? project_data.msg : [],
    header: lang.report_edit.header,
    sub_header: lang.report_edit.sub_header,
    header_url: `/my_project?flag=${encodeURIComponent(
      new Buffer.from(data.flag).toString("base64")
    )}`,
    flag: data.flag,
    cal_lang_flag: req.session.user.cal_lang_flag,
    risk_info_dt: risk_info_dt.suc > 0 ? risk_info_dt.msg : [],
    flag_name: PROJECT_LIST[data.flag],
  };
  res.render("project_work/report_view", res_data);
  // res.send(res_data)
});

ProjectRouter.post("/get_cal_unit_list_ajax", async (req, res) => {
  var data = req.body;
  var res_dt = await getCalUnitList(
    data.type_id,
    data.act_id,
    data.emi_type_id,
    data.year,
    data.flag
  );
  res.send(res_dt);
});

ProjectRouter.post("/download_pdf", async (req, res) => {
  var data = req.body;
  const browser = await puppeteer.launch({
    headless: "new",
  });

  // Open a new page
  const page = await browser.newPage();

  // Set the content of the page with your HTML
  const htmlContent = data.pdfDiv;

  await page.setContent(htmlContent);

  // Generate a PDF file
  const pdfBuffer = await page.pdf({ format: "A4" });
  // var pdfBlob = new Blob([pdfBuffer])

  // Close the browser
  await browser.close();

  // console.log(pdfBlob);

  // Send the PDF as a download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
  res.send(pdfBuffer);
});

ProjectRouter.post("/save_editor_data", async (req, res) => {
  var data = req.body;
  var res_dt = await saveProjectArticle(
    data,
    req.session.user.id,
    req.session.user.client_id,
    req.session.user.user_name
  );
  res.send(res_dt);
});

ProjectRouter.get("/other_report_view", async (req, res) => {
  var enc_data = req.query.enc_data,
    data = Buffer.from(enc_data, "base64");
  data = JSON.parse(data);
  var res_data = {
    project_id: data.proj_id,
    proj_name: data.proj_name,
    repo_type: data.repo_type,
    header: "Project Work",
    sub_header: "Project View",
    header_url: "/my_project",
  };
  res.render("project_work/other_report_view", res_data);
});

ProjectRouter.get("/test", async (req, res) => {
  res.render("project_work/test");
});

ProjectRouter.post("/save_ghg_emi_val", async (req, res) => {
  var data = req.body;
  // console.log(data);
  if (data) {
    var res_dt = await saveGhgEmi(
      data,
      req.session.user.id,
      req.session.user.user_name,
      req.session.user.client_id
    );
    res.send(res_dt);
  } else {
    res.send({ suc: 0, msg: "No data found" });
  }
});

ProjectRouter.post("/change_dis_top_status", async (req, res) => {
  var data = req.body;
  var res_dt = await saveCheckedProjectFlag(
    data,
    req.session.user.user_name,
    data.status
  );
  res.send(res_dt);
});

ProjectRouter.get("/report_full_view", async (req, res) => {
  var enc_data = req.query.enc_data,
    data_set = {};
  var data = Buffer.from(enc_data, "base64");
  data = JSON.parse(data);
  var resDt = await getDynamicData(
    0,
    data.sec_id,
    data.ind_id,
    data.top_id,
    data.flag
  );
  var susDistList = await getSusDiscList(
    data.sec_id,
    data.ind_id,
    0,
    data.flag
  );
  var metric = await getActMetrialDtls(data.sec_id, data.ind_id, data.flag);
  var editorVal = await getSavedProjectWork(
    data.sec_id,
    data.ind_id,
    data.top_id,
    data.proj_id,
    data.flag
  );
  var topName =
    resDt.suc > 0 ? (resDt.msg.length > 0 ? resDt.msg[0].topic_name : "") : "";
  var allDynamicData = await getDynamicData(
    0,
    data.sec_id,
    data.ind_id,
    0,
    data.flag
  );
  var type_list = await getCalTypeList(),
    act_list = { suc: 0, msg: [] },
    emi_type = { suc: 0, msg: [] };
  var year_list = [],
    currDate = new Date();
  var ghg_emi_list = await getGhgEmiList(
    req.session.user.client_id,
    0,
    data.proj_id
  );
  ghg_emi_list =
    ghg_emi_list.suc > 0
      ? ghg_emi_list.msg.length > 0
        ? ghg_emi_list.msg
        : []
      : [];
  var scope_list =
    ghg_emi_list.length > 0 ? ghg_emi_list.map((dt) => dt.scope) : [];
  scope_list = scope_list.length > 0 ? [...new Set(scope_list)] : [];
  var act_top_catg_list = await getActiveTopicList(data.ind_id, data.flag);
  var get_checked_top_list = await getCheckedProjectTopList(
    0,
    data.flag,
    data.proj_id
  );
  var project_data = await getProjectList(
    data.proj_id,
    req.session.user.client_id,
    0,
    data.flag,
    req.session.user.platform_mode
  );
  var met_note_dtls = await getMetNote(0, data.flag);
  console.log(met_note_dtls);

  var ghg_emi_data = {};
  if (scope_list.length > 0) {
    for (let dt of scope_list) {
      ghg_emi_data[dt] = ghg_emi_list.filter((fdt) => fdt.scope == dt);
    }
  }
  // console.log(ghg_emi_data, data.proj_id);
  // console.log(parseInt(currDate.getFullYear()));
  for (let i = 0; i <= 6; i++) {
    // console.log(i, 'Year');
    year_list.push(parseInt(currDate.getFullYear()) - i);
  }
  allDynamicData = allDynamicData.suc > 0 ? allDynamicData.msg : "";
  // console.log(resDt);
  if (resDt.suc > 0 && resDt.msg.length > 0) {
    if (resDt.msg.length == 1) {
      if (resDt.msg[0].data_file_name) {
        resDt = fs.readFileSync(
          path.join("dynamic_data_set", resDt.msg[0].data_file_name),
          "utf-8"
        );
        resDt = JSON.parse(resDt);
      }
    } else {
      for (let dt of resDt.msg) {
        if (dt.data_file_name != "") {
          var dynData = fs.readFileSync(
            path.join("dynamic_data_set", dt.data_file_name),
            "utf-8"
          );
          data_set[dt.top_id] = JSON.parse(dynData);
        }
      }
    }
  }
  // console.log(req.session.user.ai_tag_tool_flag, 'ai_tag_flag');
  var res_data = {
    top_id: data.top_id,
    topName,
    sec_id: data.sec_id,
    ind_id: data.ind_id,
    project_id: data.proj_id,
    projName: data.proj_name,
    repo_type: data.repo_type,
    resDt,
    susDistList,
    metric,
    editorData:
      editorVal.suc > 0 && editorVal.msg.length > 0 ? editorVal.msg : [],
    data_set,
    allDynamicData,
    type_list: type_list.suc > 0 ? type_list.msg : [],
    act_list: act_list.suc > 0 ? act_list.msg : [],
    emi_type: emi_type.suc > 0 ? emi_type.msg : [],
    ghg_emi_data,
    year_list,
    act_top_catg_list: act_top_catg_list.suc > 0 ? act_top_catg_list.msg : [],
    get_checked_top_list:
      get_checked_top_list.suc > 0 ? get_checked_top_list.msg : [],
    project_data: project_data.suc > 0 ? project_data.msg : [],
    met_note: met_note_dtls.suc > 0 ? met_note_dtls.msg : [],
    header: "Project Work",
    sub_header: "Project View",
    header_url: `/my_project?flag=${encodeURIComponent(
      new Buffer.from(data.flag).toString("base64")
    )}`,
    flag: data.flag,
    user_type_master: USER_TYPE_LIST,
    flag_name: PROJECT_LIST[data.flag],
  };
  res.render("project_work/report_view_template", res_data);
});

ProjectRouter.get("/get_cal_emi_source_ajax", async (req, res) => {
  var data = req.query;
  var emi_source = await getCalTypeList(0, data.flag);
  res.send(emi_source);
});

ProjectRouter.get("/deactive_project", async (req, res) => {
  var data = req.query;
  // flag = new Buffer.from(data, 'base64').toString();
//   console.log(data, "jj");
  var table_name = "td_project",
    fields = `active_flag = 'N'`,
    values = null,
    whr = `id = ${data.id}`,
    flag = 1;
  var res_dt = await db_Insert(table_name, fields, values, whr, flag);
//   console.log(res_dt, "test");
  res.redirect(`/my_project?flag=${data.flag}`);
});

ProjectRouter.get('/exist_project', async (req, res) =>{
 
    var data = req.query,
    user = req.session.user

    var select = "project_name",
      table_name = "td_project",
      whr = `replace(lower(project_name), ' ', '') = '${data.project_name.split(" ").join("").toLowerCase()}' AND repo_flag = '${data.flag}' AND client_id = ${user.client_id}`,
      order = null;
    var res_dt = await db_Select (select,table_name,whr,order);
    res.send(res_dt)
})

ProjectRouter.post('/getSusDistPointDt', async (req, res) => {
  var data = req.body
  var res_dt = await getSusDistPointDt(data.sec_id, data.ind_id, data.repo_flag, data.code)
  res.send(res_dt)
})

module.exports = { ProjectRouter };
