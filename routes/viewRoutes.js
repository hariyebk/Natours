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
// user's page
router.get('/me', authcontroller.protect, routecontroller.getAccount)
// router.post('/submit-user-data', authcontroller.protect, routecontroller.updateuserdata)
module.exports = router