const express = require('express');
const routehandlers = require('../controllers/tourscontroller');
const authcontroller = require('../controllers/authcontroller')
// creating a router object that handroutehandlers.les different routes.
const router = express.Router();
// router.param('id', routehandlers.idchecker);
// tour routes.
router.route('/stats').get(routehandlers.gettoursstats);
router.route('/monthly-plan/:year?').get(routehandlers.getMonthlyPlan);
router
  .route('/top-5-tours')
  .get(routehandlers.toptouralias, routehandlers.getalltours);
router
  .route('/5-most-cheap-tours')
  .get(routehandlers.mostcheapalias, routehandlers.getalltours);
router.route('/').get(routehandlers.getalltours).post(routehandlers.createtour); // chaining middlewares.
router
  .route('/:id?')
  .get(routehandlers.gettour)
  .patch(authcontroller.protect, authcontroller.authorized, routehandlers.updatetour)
  .delete(authcontroller.protect, authcontroller.authorized, routehandlers.deltetour); // for special requests.
module.exports = router;
// authcontroller.protect, authcontroller.authorized('admin', 'lead-guide'),