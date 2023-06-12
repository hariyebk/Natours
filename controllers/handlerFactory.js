const catchAsync = require('../utils/catchAsyncErrors')
const appError= require('../utils/appError')

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    // if no tours were found by the ID
    if (!document) return next(new appError(`No document found with that ID`, 404)); // and exits the function
    res.status(204).json({
    status: 'success',
});
})
