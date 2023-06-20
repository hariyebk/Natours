const Model = require('../models/tourmodel')
const catchAsync = require('../utils/catchAsyncErrors')
const appError = require('../utils/appError')

exports.overview = catchAsync( async (req,res, next) => {
    // Get Tour data from collection
    const tours = await Model.find()

    // Build Template

    // Render The template
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})
exports.tour = (req,res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker'
    })
}