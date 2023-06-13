const express = require('express');
const routehandlers = require('../controllers/userscontroller');
const authentication = require('./../controllers/authcontroller')
// router
const router = express.Router();
// // a middleware param to check if the user's name is correct
// router.param('name', routehandlers.userchecker);
// get all users.

// A special Api endpoint that doesn't follow the REST philosophy
router.post('/signup', authentication.signup)
router.get('/confirmEmail/:token', authentication.confirmEmail)
router.post('/login', authentication.login)
router.post('/forgotPassword', authentication.forgotPassword)
router.patch('/resetPassword/:token',authentication.protect,authentication.resetPassword)
router.patch('/updateMyPassword', authentication.protect ,authentication.updatePassword)
// for user to update his data
router
.patch('/updateMe', authentication.protect, routehandlers.updateMe)
// for user to Inactivate his account
router
.delete('/deleteMe', authentication.protect, routehandlers.deleteMe)
//  For system administrator, to get data about users.
    // get all users
router
.route('/')
.get(authentication.protect, authentication.authorized('admin', 'lead-guide'), routehandlers.getallusers)

router
.route('/:id?')
// get user
.get(authentication.protect, routehandlers.getuser)
// update user
.patch(authentication.protect, authentication.authorized('admin'), routehandlers.updateuser)
// delete user
.delete(authentication.protect, authentication.authorized('admin'), routehandlers.deleteuser);

module.exports = router;
