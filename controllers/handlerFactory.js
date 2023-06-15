const catchAsync = require('../utils/catchAsyncErrors')
const appError= require('../utils/appError')
const apiFeatures = require('../utils/apiFeatures');
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
exports.finddoc = (Model, populate) => catchAsync( async (req, res, next) => {
    let query = Model.findById(req.params.id) // return a promise
    if(populate) query = query.populate(populate)
    const doc = await query 
    if(!doc) return next(new appError('No document found with this id', 404))
    res.status(200).json({
        status: "success",
        data: doc
    })
})
exports.findalldoc = Model => catchAsync(async (req, res, next) => {
    let filter = {}
    if(req.params.TourId) filter = {tour: req.params.TourId}
    // if the tour Id exists within the url , we display all the reviews for that tour
    // if the tour Id doesn't exist within the url, filetr will bw empty object which means all documents will be displayed
    // handles all kinds of queries (filtering, sorting,pagination)
    const features = new apiFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limit()
        .page();
        // query statics
    // const doc = await features.queryObj.explain();
    const doc = await features.queryObj
        res.status(200).json({
        status: 'success',
        results: doc.length,
        data: doc
    });
});