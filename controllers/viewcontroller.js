const Model = require('../models/tourmodel')
const userModel = require('../models/usermodel')
const catchAsync = require('../utils/catchAsyncErrors')
const authcontroller = require('./authcontroller')
const appError = require('../utils/appError')

exports.overview = catchAsync( async (req,res, next) => {
    // Get Tour data from collection
    const tours = await Model.find()
    // Render The template
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})
exports.tour = catchAsync( async (req,res, next) => {
    const tour = await Model.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'rating review user'
    })
    if(!tour) return next(new appError('No tour found with This name', 404))
    res.status(200).render('tour', {
        title: tour.name,
        tour
    })
})
exports.login = (req, res) => {
    res.status(200).render('login', {
        title: "Login"
    })
}
exports.signup = (req, res) => {
    res.status(200).render('signup', {
        title: 'Create Account'
    })
}
exports.confirmEmail = (req, res) => {
    res.status(200).render('confirmEmail', {
        title: 'Confirm your email'
    })
}
exports.resetPassword = (req, res) => {
    res.status(200).render('resetPasswords', {
        title: 'Reset Password',
    })
}
exports.verified = (req, res) => {
    // verfiy confirmation token 
    authcontroller.confirmEmail()
    // redirect user to the home page
    res.redirect('/')
}
exports.getAccount = (req, res) => {
    res.status(200).render('userprofile', {
        title: 'My Account'
    })
}
