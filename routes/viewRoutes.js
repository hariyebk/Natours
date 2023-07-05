const express = require('express')
const router = express.Router()
const routecontroller = require('../controllers/viewcontroller')
const authcontroller = require('../controllers/authcontroller')

// overview page
router.get('/', authcontroller.isLoggedIn,  routecontroller.overview)
// Tours page
router.get('/tour/:slug', authcontroller.isLoggedIn,  routecontroller.tour)
// Log in page
router.get('/login', authcontroller.isLoggedIn,  routecontroller.login)
// sign up page
router.get('/signup', routecontroller.signup)
// email confirmation
router.get('/confirmEmail', routecontroller.confirmEmail)
// user verfied their email
router.get('/verifyEmail', authcontroller.confirmEmail)
// forgot password page
router.get('/forgotpassword', routecontroller.forgotpassword)
// reset new password
router.get('/resetPassword', routecontroller.resetPassword)
// user's page
router.get('/me', authcontroller.protect, routecontroller.getAccount)
// router.post('/submit-user-data', authcontroller.protect, routecontroller.updateuserdata)
module.exports = router