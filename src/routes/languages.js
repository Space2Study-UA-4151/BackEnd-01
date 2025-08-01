const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const langMiddleware = require('~/middlewares/appLanguage')
const languagesController = require('~/controllers/languages')

router.get('/', langMiddleware, asyncWrapper(languagesController.getLanguages))

module.exports = router
