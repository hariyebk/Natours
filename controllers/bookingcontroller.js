const catchAsyc = require('../utils/catchAsyncErrors')
const appError = require('../utils/appError')
const handlers = require('./handlerFactory')
const bookingModel = require('../models/bookingmodel')
const Model = require('../models/tourmodel')
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
exports.createbooking = handlers.createdoc(bookingModel)
exports.getAllbookings = handlers.findalldoc(bookingModel)
exports.getbooking = handlers.finddoc(bookingModel)
exports.updatebooking = handlers.updatedoc(bookingModel)
exports.deletebooking = handlers.deletedoc(bookingModel)