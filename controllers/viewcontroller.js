const Model = require('../models/tourmodel')
const userModel = require('../models/usermodel')
const bookingModel = require('../models/bookingmodel')
const reviewModel = require('../models/reviewmodel')
const catchAsync = require('../utils/catchAsyncErrors')
const authcontroller = require('./authcontroller')
const appError = require('../utils/appError')
const catchAsyc = require('../utils/catchAsyncErrors')

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
exports.forgotpassword = (req, res) => {
    res.status(200).render('forgotpassword', {
        title: 'Forgot Password'
    })
}
exports.resetPassword = (req, res) => {
    res.status(200).render('resetPasswords', {
        title: 'Reset Password',
    })
}
exports.getMytours = catchAsyc( async (req, res, next) => {
    // find all bookings the user has booked
    const bookings = await bookingModel.find({user: req.user.id})
    //  tours id's from the bookings
    const tourIds = bookings.map(el => el.tour)
    // actual tour data based
    const tours = await Model.find({_id: {$in: tourIds}})
    // for api requests
    if(req.originalUrl.startsWith('/api')){
        // we only want to send the name of the tours that the user has booked if the request comes from the api.
        const Tours = tours.map(tour => tour.name)
        return res.status(200).json({
            status: "success",
            results: tours.length,
            Tours
    })
}
    // PICKS all the tours if their id's is found on the tourIds array.
    res.status(200).render('overview', {
        title: 'My-Tours',
        tours
    })
})
exports.getMyreviews = catchAsyc( async (req, res, next) => {
    // find the reviews the user has made
    const reviews = await reviewModel.find({user: req.user.id})
    // for api requests
    if(req.originalUrl.startsWith('/api')){
        // we only return the following fields for My-review api endpoint call.
        const Reviews = reviews.map(r => {
            return {
                tour: r.tour.name,
                rating: r.rating,
                review: r.review
            }
        })
        return res.status(200).json({
            status: "success",
            results: reviews.length,
            Reviews
        })
    }
    // display review cards
    res.status(200).render('reviews', {
        title: 'My Reviews',
        reviews
    })
})
exports.getAccount = (req, res) => {
    res.status(200).render('userprofile', {
        title: 'My Account'
    })
}
