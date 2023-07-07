const express = require('express')
const router = express.Router()
const routecontroller = require('../controllers/viewcontroller')
const bookingcontroller = require('../controllers/bookingcontroller')
const authcontroller = require('../controllers/authcontroller')

// overview page
router.get('/', bookingcontroller.createbookingbyCheckout, authcontroller.isLoggedIn,  routecontroller.overview)
// Tours page
router.get('/tour/:slug', authcontroller.isLoggedIn, routecontroller.checkifbooked, routecontroller.tour)
// Log in page
router.get('/login', authcontroller.isLoggedIn,  routecontroller.login)
// sign up page
router.get('/signup', routecontroller.signup)
// email confirmation
router.get('/confirmEmail', routecontroller.confirmEmail)
// user verfied their email
router.get('/verifyEmail/:token', authcontroller.confirmEmail)
// forgot password page
router.get('/forgotpassword', routecontroller.forgotpassword)
// reset new password
router.get('/resetpassword', routecontroller.resetPassword)
// user's page
router.get('/me', authcontroller.protect, routecontroller.getAccount)
// Tours the user has booked
router.get('/My-tours', authcontroller.protect,  routecontroller.getMytours)
// Tours the user has reviews
router.get('/My-reviews', authcontroller.protect, routecontroller.getMyreviews)
// router.post('/submit-user-data', authcontroller.protect, routecontroller.updateuserdata)
module.exports = router