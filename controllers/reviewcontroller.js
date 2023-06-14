const reviewModel = require('../models/reviewmodel')
const catchAsync = require('../utils/catchAsyncErrors')
const handlers = require('./handlerFactory')

exports.setIdandTour = (req,res,next) => {
    if(!req.body.author) req.body.author = req.user.id
    if(!req.body.tour) req.body.tour = req.params.TourId
    console.log(req.body.author)
    console.log(req.body.tour)
    next()
}
exports.getreviews = handlers.findalldoc(reviewModel)
exports.postreview = handlers.createdoc(reviewModel)
exports.updatereview = handlers.updatedoc(reviewModel)
exports.deletereview = handlers.deletedoc(reviewModel)
exports.getreview = handlers.finddoc(reviewModel)
exports.deleteallreviews = catchAsync( async (req, res, next) => {
    await reviewModel.deleteMany()
    res.status(204).json({
        status: "success"
    })
})