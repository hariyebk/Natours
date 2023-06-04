const Model = require('../models/tourmodel');
const apiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsyncErrors');
const appError = require('../utils/appError');
// a middleware(param) inside another middleware(param) that check for the right id

// middleware for aliases
exports.mostcheapalias = (req, res, next) => {
  req.query.sort = 'price';
  req.query.limit = '5';
  req.query.fields = 'name,duration,price,ratingAvarage,summary';
  next();
};
exports.toptouralias = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingAvarage';
  req.query.fields = 'name,duration,price,difficulty,ratingAvarage';
  next();
};
// route handlers should not deal with duplicate way of handling errors with try catch blocks. so lets delegate a function for it
// route handlers for tours
exports.getalltours = catchAsync(async (req, res, next) => {
  // handles all kinds of queries (filtering, sorting,pagination)
  const features = new apiFeatures(Model.find(), req.query)
    .filter()
    .sort()
    .limit()
    .page();
  const tours = await features.queryObj;
  // the argument that we should pass to the Model.find() should the same query as
  // route handler
  // enveloping our data for security measures. jsend
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});
exports.createtour = catchAsync(async (req, res, next) => {
  // easy way for creating and uploading documents in our remote database.
  const doc = await Model.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: doc,
    },
  });
});
exports.gettour = catchAsync(async (req, res, next) => {
  // populate method embedes the referenced dataset into the parent dataset
  const tour = await Model.findById(req.params.id).populate('guides')
  // if no tours were found by the ID
  if (!tour) {
    return next(new appError('No tour found with that ID', 404)); // and exits the function
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.updatetour = catchAsync(async (req, res, next) => {
  const tour = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  // if no tours were found by the ID
  if (!tour) return next(new appError('No tour found with that ID', 404)); // and exits the function
  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.deltetour = catchAsync(async (req, res, next) => {
  const tour = await Model.findByIdAndDelete(req.params.id);
  // if no tours were found by the ID
  if (!tour) return next(new appError('No tour found with that ID', 404)); // and exits the function
  res.status(204).json({
    status: 'success',
  });
});
// aggregation pipeline for stats
exports.gettoursstats = catchAsync(async (req, res, next) => {
  // aggregation pipeline
  const stats = await Model.aggregate([
    // stages
    {
      // filtering documents
      $match: { ratingAvarage: { $gte: 4.5 } },
    },
    {
      //grouping documents
      $group: {
        // based on what field we want to group.
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAvarage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // sorting
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});
// aggregation pipeline for the busiest month for tours
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await Model.aggregate([
    // The pipe
    {
      // deconstructs an array and creates a document for each element of the array.
      $unwind: '$startDates',
    },
    {
      // filtering out documets by year from the query string
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // start of the year.
          $lte: new Date(`${year}-12-31`), // end of the year.
        },
      },
    },
    {
      $group: {
        // grouping by the month
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        // creates an array of the tour names
        tours: { $push: '$name' },
      },
    },
    {
      // add a new field
      $addFields: { month: '$_id' },
    },
    {
      // removing fields
      $project: { _id: 0 },
    },
    {
      // sorting based on the number of tours.
      $sort: { numTours: -1 },
    },
    {
      // limits the results to 12
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});
// The MongoDB aggregation pipeline is a powerful tool for data analysis and reporting. It can be used to perform a wide range of operations, including filtering, grouping, sorting, and transforming data. By chaining together multiple stages, you can create complex transformations that can be used to generate insights and reports from your data. The pipeline is made up of a sequence of stages, each of which performs a specific operation on the input documents. The output of one stage becomes the input of the next stage, allowing you to create a series of transformations that can be used to generate complex reports and analysis.
