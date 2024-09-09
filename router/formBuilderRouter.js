const FBRouter = require('express').Router()

FBRouter.get('/form_builder', async (req, res) => {
    res.render('form_builder/entry')
})

module.exports = {FBRouter}