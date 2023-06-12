const reviewModel = require('../models/reviewmodel')
const catchAsync = require('../utils/catchAsyncErrors')
const appError = require('../utils/appError')
const handlers = require('./handlerFactory')

exports.postreview = catchAsync( async (req, res, next) => {
    if(!req.body.author) req.body.author = req.user.id
    if(!req.user.tour) req.body.tour = req.params.TourId
    const review = await reviewModel.create(req.body)
    // // check if current user and reviews author id matches
    // if(review.author[0] != req.user.id) return next(new appError(`Author's Id doesn't match with the current user`, 400))
    res.status(201).json({
        status: "success",
        data: {
            review
        }
    })
})
exports.getreviews = catchAsync( async (req, res, next) => {
    let filter = {}
    if(req.params.TourId) filter = {tour: req.params.TourId}
    // if the tour Id exists within the url , we display all the reviews for that tour
    // if the tour Id doesn't exist within the url, we display all reviews for all tours.
    const reviews = await reviewModel.find(filter)
    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: {
            reviews
        }
    })
})
// exports.getreview = catchAsync( async (req, res, next) => {
//     const review = await reviewModel.findById(req.params.id)
//     if(!review) return next(new appError('No review found with this Id', 404))
//     res.status(200).json({
//         status: 'success',
//         data: {
//             review
//         }
//     })

// })
exports.updatereview = catchAsync( async (req, res, next) =>{
    const review = await reviewModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if(!review) return next(new appError('No review found with this Id', 404))
    res.status(201).json({
        status: "success",
        data: {
            review
        }
    })
})
exports.deletereview = handlers.deleteOne(reviewModel)

exports.deleteallreviews = catchAsync( async (req, res, next) => {
    await reviewModel.deleteMany()
    res.status(204).json({
        status: "success"
    })
})