const catchAsync = require('../utils/catchAsyncErrors')
const appError= require('../utils/appError')

// Refactor
    // The fucntion after the arrow is returned implicitly
exports.deletedoc = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    // if no tours were found by the ID
    if (!document) return next(new appError(`No document found with that ID`, 404)); // and exits the function
    res.status(204).json({
    status: 'success',
});
})
exports.createdoc = Model=> catchAsync(async (req, res, next) => {
    // easy way for creating and uploading documents in our remote database.
    const doc = await Model.create(req.body);
    res.status(201).json({
    status: 'success',
    data: doc
    });
});
exports.updatedoc = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    });
    // if no tours were found by the ID
    if (!doc) return next(new appError('No document found with that ID', 404)); // and exits the function
    res.status(201).json({
    status: 'success',
    data: doc
    });
});
exports.finddoc = Model => catchAsync( async (req, res, next) => {
    const doc = await Model.findById(req.params.id)
    if(!doc) return next(new appError('No document found with this id', 404))
    res.status(200).json({
        status: "success",
        data: doc
    })
})