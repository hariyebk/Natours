const Model = require('../models/tourmodel');
const appError = require('../utils/appError');
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

exports.gettoursByRadius = catchAsync( async (req, res, next) => {
    // Getting url parameters
    const {distance, latlng, unit } = req.params
    // Destructuring the location coordinate string in req.params
    const [lat, lng] = latlng.split(',')
    if(!lat || !lng) return next(new appError('Please provide Your current geographical coordinates', 400))
    // the radius in $centerShpere should be in radians
    const radius = unit === 'mi'? distance/3963.2 : distance/6378.1 // dividing the distance by the earth's radius.
    
// MongoDB supports several geospatial queries that allow you to perform spatial operations on geospatial data. Here are some of the most commonly used geospatial queries in MongoDB: $geoWithin: This operator returns documents that are within a given polygon, specified as a GeoJSON object.$near: This operator returns documents that are within a specified distance of a point, specified as a GeoJSON object. $geoIntersects: This operator returns documents that intersect with a given geometry, specified as a GeoJSON object. $geometry: This operator allows you to specify a geometry in a geospatial query. You can use this operator with other geospatial operators to perform complex geospatial queries.$centerSphere: This operator returns documents that are within a specified radius of a point, specified as a GeoJSON object. $box: This operator returns documents that are within a specified bounding box, specified as a GeoJSON object.To use these geospatial queries in MongoDB, you will need to create a geospatial index on your collection. This index allows MongoDB to efficiently perform geospatial queries on your data. To create a geospatial index, you can use the createIndex() method and specify the location field as the index key and the "2dsphere" or "2d" index type. The "2dsphere" index type is used for more complex queries that involve polygons and other complex geometries, while the "2d" index type is used for simpler queries that involve points and bounding boxes.
    // tours that are found within a certain radius from the users location
    const tours = await Model.find({
      startLocation: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius] 
        }
      }
    })
    // If there are no tours within the provided distance
    if(!tours) return next(new appError(`No Tours Found within this ${distance} ${unit} Range `))
    res.status(200).json({
      status: "success",
      results: tours.length,
      data:  tours
    })
})
exports.getTourDistances = catchAsync( async (req, res, next) => {
  const {latlng, unit } = req.params
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    // Destructuring the location coordinate string in req.params
    const [lat, lng] = latlng.split(',')
    if(!lat || !lng) return next(new appError('Please provide Your current geographical coordinates', 400))
    // GEOSPATIAL AGGREGATION PIPELINE : only has one stage => $geoNear and it should be the first stage. 
    const Distance = await Model.aggregate([
      {
        $geoNear: {
           // the reference point to which the distance for all tours is calculated.
          near: {
            type: 'Point',
            coordinates: [lng*1, lat*1]
          },
          // the property name to store the results
          distanceField: 'distance',
          // All distances are multiplied by this to convert meters into kilometers
          distanceMultiplier: multiplier
        }
      },
      {
        $project : {
          distance: 1,
          name: 1
        }
      }
  ])

  res.status(200).json({
    status: "success",
    data: Distance
  })

})
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
