const express = require('express')
const authcontroller = require('../controllers/authcontroller')
const routehandlers = require('../controllers/reviewcontroller')
const router = express.Router()
// post and get reviews
router
.post('/createReview', authcontroller.protect, authcontroller.authorized('user'), routehandlers.postreview)
.get('/GetAllReviews', authcontroller.protect, routehandlers.getallreviews)
.delete('/DeleteAllReviews' , routehandlers.deleteallreviews)

// update, delete and get specific reviews
router
.route('/:id')
.get(authcontroller.protect, routehandlers.getreview)
.patch(authcontroller.protect, authcontroller.authorized('user'), routehandlers.updatereview)
.delete(authcontroller.protect, authcontroller.authorized('user'), routehandlers.deletereview)

module.exports = router

