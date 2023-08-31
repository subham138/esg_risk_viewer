const express = require("express"),
  DataCollectionRouter = express.Router();

const { getSectorList, getIndustriesList } = require("../modules/AdminModule");

DataCollectionRouter.get("/sus_disc", async (req, res) => {
  var selected = {
    sec_id: req.query.sec_id ? req.query.sec_id : 0,
    ind_id: req.query.ind_id ? req.query.ind_id : 0,
  };
  var sec_data = await getSectorList(),
    ind_list = [];
  if (selected.sec_id > 0)
    ind_list = await getIndustriesList(null, selected.sec_id);
  var data = {
    sec_data,
    ind_list,
    selected,
    header: "Sustainability Disclosure Topics & Metrics",
  };
  res.render("data_collection/sus_disc", data);
});

module.exports = { DataCollectionRouter };
