const Model = require('../models/tourmodel')
const userModel = require('../models/usermodel')
const catchAsync = require('../utils/catchAsyncErrors')
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
exports.getAccount = (req, res) => {
    res.status(200).render('userprofile', {
        title: 'My Account'
    })
}