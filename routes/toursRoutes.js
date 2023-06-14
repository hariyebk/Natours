const express = require('express');
const routehandlers = require('../controllers/tourscontroller');
const authcontroller = require('../controllers/authcontroller')
const reviewrouter = require('../routes/reviewRoutes')
// creating a router object that handroutehandlers.les different routes.
const router = express.Router();
// router.param('id', routehandlers.idchecker);

// Nested Route: redirecting to the child Router
router.use('/:TourId/reviews', reviewrouter)
// tour stats
router
.route('/stats')
.get(routehandlers.gettoursstats);
// tours per year
router
.route('/monthly-plan/:year?')
.get(authcontroller.protect, authcontroller.authorized('admin', 'lead-guide', 'guide'), routehandlers.getMonthlyPlan);
// top rated tours
router
.route('/top-5-tours')
.get(routehandlers.toptouralias, routehandlers.getalltours);
// the most cheap tours
router
.route('/5-most-cheap-tours')
.get(routehandlers.mostcheapalias, routehandlers.getalltours);
// create and get tours
router
.route('/')
.get(routehandlers.getalltours) // if other websites want to use our api
.post(authcontroller.protect, authcontroller.authorized('admin','lead-guide'), routehandlers.createtour); // chaining middlewares.

// update, delete and get specific tours
router
.route('/:id?')
.get(routehandlers.gettour) // anyone can access our api
.patch(authcontroller.protect, authcontroller.authorized('admin', 'lead-guide'), routehandlers.updatetour)
.delete(authcontroller.protect, authcontroller.authorized('admin', 'lead-guide'), routehandlers.deletetour); // for special requests.
module.exports = router;
// authcontroller.protect, authcontroller.authorized('admin', 'lead-guide'),