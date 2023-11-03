const express = require("express");
imgGalaryRouter = express.Router(),
fileUpload = require('express-fileupload');

imgGalaryRouter.use(fileUpload());

imgGalaryRouter.get("/img_upload", async(req, res) => {
    res.render('img_upload/view');
})

imgGalaryRouter.post('/upload', async (req, res) => {
    console.log(req.files);
})

module.exports = {imgGalaryRouter}