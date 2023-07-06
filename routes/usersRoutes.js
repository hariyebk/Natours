const express = require('express');
const routehandlers = require('../controllers/userscontroller');
const authentication = require('./../controllers/authcontroller')
const viewcontroller = require('../controllers/viewcontroller')
// router
const router = express.Router();
// // a middleware param to check if the user's name is correct
// router.param('name', routehandlers.userchecker);
// get all users.
// A special Api endpoint that doesn't follow the REST philosophy
router.post('/signup', authentication.signup)
router.get('/confirmEmail/:token', authentication.confirmEmail)
router.post('/login', authentication.login)
router.get('/logout', authentication.logout)
router.post('/forgotPassword', authentication.forgotPassword)
router.patch('/resetPassword', authentication.resetPassword)

// since middlewares run based on order. all endpoints that come next will be secured.
router.use(authentication.protect)

// My BOOKINGS
router.get('/My-tours', authentication.authorized('user'), viewcontroller.getMytours)
// My REVIEWS
router.get('/My-reviews', authentication.authorized('user'),  viewcontroller.getMyreviews)
// for user to update his data
router
.patch('/updateMyPassword', authentication.updatePassword)

router
.patch('/updateMe', routehandlers.uploadPhoto, routehandlers.resizeUploadedPhoto, routehandlers.updateMe)
// for user to Inactivate his account
router
.delete('/deleteMe', routehandlers.deleteMe)
// for user to see his/her data
router
.get('/me', routehandlers.getme, routehandlers.getuser)
//  For system administrator, to get data about users.

router.use(authentication.authorized('admin', 'lead-guide'))
// get all users
router
.route('/')
.get(routehandlers.getallusers)

router
.route('/:id?')
// get user
.get(routehandlers.getuser)
// update user
.patch(routehandlers.updateuser)
// delete user
.delete(routehandlers.deleteuser);

module.exports = router;
