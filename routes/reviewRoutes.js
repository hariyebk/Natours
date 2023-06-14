const express = require('express')
const authcontroller = require('../controllers/authcontroller')
const routehandlers = require('../controllers/reviewcontroller')
// child router: can access routes from the parent router
const router = express.Router({mergeParams: true})
router.use(authcontroller.protect)
// post and get reviews
router
.route('/')
.post(authcontroller.authorized('user'), routehandlers.setIdandTour, routehandlers.postreview)
.get(routehandlers.getreviews)
.delete(authcontroller.authorized('admin'), routehandlers.deleteallreviews)

// update, delete and get specific reviews
router
.route('/:id')
.get(routehandlers.getreview)
.patch(authcontroller.authorized('user', 'admin'), routehandlers.updatereview)
.delete(authcontroller.authorized('user', 'admin'), routehandlers.deletereview)

module.exports = router

