const Model = require('../models/tourmodel');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsyncErrors');
const handlers = require('./handlerFactory')
const upload = require('../utils/multer')
const sharp = require('sharp')
// A middleware that handles Multiple tour image uploads
exports.uploadTourImages = upload.fields([{name: 'imageCover', maxCount: 1}, {name: 'images', maxCount: 3}])
// for single image upload we use : upload.single('filedname') and it returns req.file
// for multiple image uploads with only one field name we use: upload.array('fieldname', maxCount: 3) and it returns req.files
// for multiple image uploads with different field names we use: upload.fields('fieldname', maxCount: 5) and it returns req.


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

// A middleware to process the uploaded image
exports.resizeTourImages = catchAsync( async (req, res, next) => {
  if(!req.files) return next()
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
  // resizing tour images that are uploaded

  // for the cover image
  if(req.files.imageCover){
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({quality: 90})
      .toFile(`./public/img/tours/${imageCoverFileName}`)
    // pass the resized tour image to the req.body
    req.body.imageCover = imageCoverFileName
  }
  // for images
  if(req.files.images){
  req.body.images = []
    await Promise.all(
      // resizing each image in the req.files.images array
      req.files.images.map(async (img, i) => {
        // the file name for each individual image
        const filename = `tour-${req.params.id}-${Date.now()}-${i}`
        await sharp(img.buffer)
        .resize(500, 500)
        .toFormat('jpg')
        .jpeg({quality: 90})
        .toFile(`./public/img/tours/${filename}`)
        // add each resized image into req.body.image
        req.body.images.push(filename)
      })
    )
  }
  next()
})
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
