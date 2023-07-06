const express = require('express')
const routecontroller = require('../controllers/bookingcontroller')
const authcontroller = require('../controllers/authcontroller')
// child router can access routes from the parent router
const router = express.Router({mergeParams: true})
// Only authenticated users can access this Api endpoint.
router.use(authcontroller.protect)
// book a tour by stripe's checkout session
router.get('/checkout-session/:id',routecontroller.getcheckoutsession)
// book a Tour 
router.post('/', authcontroller.authorized('user'), routecontroller.restrictbooking, routecontroller.setIdandTour, routecontroller.createbooking)
// Only Authorized users can access this Api endpoint.
router.use(authcontroller.authorized('admin', 'lead-guide'))
// Get all booked tours
router.get('/', routecontroller.getAllbookings)
// update, delete and get one booked tour
router
.route('/:id')
.get(routecontroller.getbooking)
.patch(routecontroller.updatebooking)
.delete(routecontroller.deletebooking)

module.exports = router