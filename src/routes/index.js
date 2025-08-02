const router = require('express').Router()
const { authMiddleware, restrictTo } = require('../middlewares/auth')

const auth = require('~/routes/auth')
const user = require('~/routes/user')
const email = require('~/routes/email')
const adminInvitation = require('~/routes/adminInvitation')
const question = require('~/routes/question')
const resourcesCategory = require('~/routes/resourcesCategory')
const offer = require('~/routes/offer')

router.use('/auth', auth)
router.use('/users', authMiddleware, user)

router.use('/send-email', email)

router.use('/admin-invitations', authMiddleware, restrictTo('admin'), adminInvitation)

router.use('/questions', authMiddleware, question)
router.use('/resources-categories', authMiddleware, resourcesCategory)
router.use('/offers', authMiddleware, offer)

module.exports = router
