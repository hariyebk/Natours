const express = require('express')
const authcontroller = require('../controllers/authcontroller')
const routehandlers = require('../controllers/reviewcontroller')
// child router: can access routes from the parent router
const router = express.Router({mergeParams: true})
// post and get reviews
router
.route('/')
.post(authcontroller.protect, authcontroller.authorized('user'), routehandlers.setIdandTour, routehandlers.postreview)
.get(authcontroller.protect, routehandlers.getreviews)
.delete(routehandlers.deleteallreviews)

// update, delete and get specific reviews
router
.route('/:id')
.get(authcontroller.protect, routehandlers.getreview)
.patch(authcontroller.protect, authcontroller.authorized('user'), routehandlers.updatereview)
.delete(authcontroller.protect, authcontroller.authorized('user'), routehandlers.deletereview)

module.exports = router

