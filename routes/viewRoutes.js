const express = require('express')
const router = express.Router()
const routecontroller = require('../controllers/viewcontroller')

// overview page
router.get('/', routecontroller.overview)
// Tours page
router.get('/tour', routecontroller.tour)

module.exports = router