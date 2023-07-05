const express = require('express')
const routecontroller = require('../controllers/bookingcontroller')
const authcontroller = require('../controllers/authcontroller')
const router = express.Router()
router.get('/checkout-session/:id', authcontroller.protect, routecontroller.getcheckoutsession)
module.exports = router