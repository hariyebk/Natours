const Model = require('../models/tourmodel');
const catchAsync = require('../utils/catchAsyncErrors');
const handlers = require('./handlerFactory')
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
exports.getalltours = handlers.findalldoc(Model)
exports.createtour = handlers.createdoc(Model)
exports.updatetour = handlers.updatedoc(Model)
exports.deletetour = handlers.deletedoc(Model)
exports.gettour = handlers.finddoc(Model, {path: 'reviews'})
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
         // feilds to be returned
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
