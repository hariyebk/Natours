const catchAsyc = require('../utils/catchAsyncErrors')
const appError = require('../utils/appError')
const handlers = require('./handlerFactory')
const bookingModel = require('../models/bookingmodel')
const Model = require('../models/tourmodel')
const mongoose = require('mongoose')
const stripe = require('stripe')(process.env.STRIPE_SECRET_API_KEY)
exports.getcheckoutsession = catchAsyc( async (req, res, next) => {
    // Get the currently booked tour
    const tour = await Model.findById(req.params.id)
    // create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // where the user shoud be redirected after a successfull payment operation.
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.id}&user=${req.user.id}&price=${tour.price}`,
        // where the user shoud be redirected after a failed payment trial.
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        // creates a new booking data based on what we have specified here
        line_items: [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                name: tour.name,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
                },
                unit_amount: tour.price * 100,
            },
            quantity: 1,
        },
            ],
            mode: 'payment',
    })
    // send it to the client
    res.status(200).json({
        status: "success",
        session
    })
})
exports.createbookingbyCheckout = catchAsyc(async (req, res, next) => {
    // destructure the queryStrings
    const {tour,user,price} = req.query
    // if there is no query string in the home page url skip.
    if(!tour && !user && !price) return next()
    // create the booking
    await bookingModel.create({tour, user, price})
    // redirecting the user to the homepage agin, now with no query strings
    res.redirect('/')
})
exports.restrictbooking = catchAsyc( async (req, res, next) => {
    // find all bookings the user has booked
    const bookings = await bookingModel.find({user: req.user.id})
    //  tours id's from the bookings
    // check if the current tour's id is in tourIds
    const tourIds = bookings.map(el => el.tour).map(el => String(el))
    // sincd the touIds are mongoose object Ids and req.params.TourId is a string
    if(tourIds.includes(req.params.TourId)){
        // for Api requests
        if(req.originalUrl.startsWith('/api') && req.originalUrl.endsWith('/bookings')){
            // restrict the user from booking the same Tour
            res.status(401).json({
                status: "Fail",
                message: "You have Already booked This Tour"
            })
        }
        return next()
    }
    else{
        // The user has to book the tour in order to review it.
        if(req.originalUrl.endsWith('/reviews') && req.originalUrl.startsWith('/api')){
            return res.status(401).json({
                status: "Fail",
                message: "You need To book the Tour In order to review it !!"
            })
        }
        next()
    }
})
exports.setIdandTour = catchAsyc( async (req,res,next) => {
    if(!req.body.user) req.body.user = req.user.id
    if(!req.body.tour) req.body.tour = req.params.TourId
    if(!req.body.price){
        const tour = await Model.findById(req.params.TourId)
        if(!tour) return next(new appError('No Tour is found with this Id'))
        req.body.price = tour.price
    }
    next()
})
exports.createbooking = handlers.createdoc(bookingModel)
exports.getAllbookings = handlers.findalldoc(bookingModel)
exports.getbooking = handlers.finddoc(bookingModel)
exports.updatebooking = handlers.updatedoc(bookingModel)
exports.deletebooking = handlers.deletedoc(bookingModel)