const express = require('express')
const router = express.Router()
const routecontroller = require('../controllers/viewcontroller')
const authcontroller = require('../controllers/authcontroller')

// overview page
router.get('/', routecontroller.overview)
// Tours page
router.get('/tour/:slug', authcontroller.protect, routecontroller.tour)
// Log in page
router.get('/login', routecontroller.login)

module.exports = router