const mongoose = require('mongoose')
const slugify = require('slugify')
// const validator = require('validator')
// Business logic how the data should be stored.

// Data validation with mongoose.
// defining schema for our databse model.
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true, // removing white spaces
        // 3rd party string validator
            // checks if the name is only letters and no spaces. otherwise it fires an error
        // validate: [validator.isAlpha, 'A Tour name must only contain letters'],
        // Builtin Data Validators for strings
        maxLength: [20, `A tours's name should not exceed 20 characters`],
        minLength: [5, `A tour's name should not be less than 5 characters`]
    },
    slug: String,
    duration:{
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A tour must have a maximum group size']
    },
    difficulty:{
        type: String,
        required: [true, 'A tour must have a difficulty'],
        // Builtin Data validator
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'A difficulty should be either: easy, medium or difficult'
        }
    },
    ratingAvarage: {
        type: Number,
        default: 4.5,
        // Builtin data validator
        min: [1, `A rating should be above 1.0`],
        max: [5, `A rating should be below 5.0`],
        set: val => Math.round(val * 10) / 10
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: {
        type: Number,
        // Custom Data Validation
        validate: {
            validator: function(discount){
                // the discount should be less than the actual price.
                // if it returns false , it fires a validation error.
                return discount > this.price
                // it can access the current document only during document creation.
            },
            message: 'A discount ({VALUE}) should be below the regular price.'
        }
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour should have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have an image cover']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // hiding sensetive info from the client.
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    // GeoJSON object
    startLocation: {
        type:{
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
    },
    // creating embeded dataset 
    locations: [
        {
        type:{
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }
],
    // child referencing
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            // reference should be the dataset collection name
            ref: 'users',
        }
    ]

}, {
    // each time the data is sent in json and object format, we are telling the schema to include the virtuals
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

// Indexes are an important tool for improving read performance as they allow the database to quickly locate relevant documents without having to scan the entire collection.1. Identify frequently queried fields: Start by identifying the fields that are frequently queried in your application. 2. Use compound indexes: If your queries involve multiple fields, consider using compound indexes that include all the relevant fields. This can improve query performance by allowing the database to quickly locate documents that match all the specified criteria. 3. Avoid indexing large fields: Avoid indexing large fields like text or binary data, as this can increase index size and slow down query performance. 5. Be cautious with unique indexes: While unique indexes can help enforce data integrity, they can also slow down write performance.

// compound indexes
schema.index({price: 1, ratingAvarage: -1})
// single index
schema.index({slug: 1})
// geospatial index
schema.index({startLocation: '2dsphere'})
// Virtual fields provide additional fields that doesn't need to be stored in the databse. 
schema.virtual('durationWeeks').get(function(){
    // setting the value for the field
    return this.duration / 7
})
schema.virtual('plan').get(function(){
    if(+this.price < 1000){
        return 'Basic'
    }
    if(+this.price >= 1000 && +this.price < 2000){
        return 'Standard'
    }
    if(+this.price > 2000){
        return 'premium'
    }
})
// virtual populate: replacing the references with the actual data without persisting into the database.
schema.virtual('reviews', {
    ref: 'reviews',
    // forignField is the field name that refers the current model in reviews model
    foreignField: 'tour',
    // localField is the mongoose ObjectId for the current model
    localField: '_id'
})
schema.virtual('bookings', {
    ref: 'bookings',
    // forignField is the field name that refers the current model in reviews model
    foreignField: 'tour',
    // localField is the mongoose ObjectId for the current model
    localField: '_id'
})
// In Mongoose, middleware functions can be used to execute custom logic before or after certain events occur in the document lifecycle. These middleware functions can be very powerful and flexible, allowing you to add custom logic to your Mongoose schema and models at various points in the document lifecycle.
// DOCUMENT MIDDLEWARE: runs only before the save() or create() commands.
        // pre hook

schema.pre('save', function(next){
    // creates the slug field before the document is saved in the database.
    this.slug = slugify(this.name , {lower: true});
    next()
}).post('save', function(doc,next){
//     console.log(doc) // logs the document after it is saved.
    next()
})

// finding the guides based on the id.
// schema.pre('save', async function(next){
//     // since the async function returns a promise, guidepromises is an array of promises
//     const guidepromises = this.guides.map(async id => await userModel.findById(id))
//     // run the promises at the same time with promise.all([])
//     this.guides = await Promise.all(guidepromises)
//     next()
// })
// QUERY MIDDLEWARE : runs before any query that starts with find (find, findOne,findMany)
schema.pre(/^find/, function(next){
    // It has access to the query object.
       // hiding the secret tours so that the public can't see them.
    this.find({secretTour: {$ne: true}})
    next() // passes the filtered query object.
})
// populating the child refrence with the actual guide data
schema.pre(/^find/, function(next){
    // using populate method reduces performance because it uses find query behind the scences.
    this.populate({
        path: "guides",
        select: ['-__v -passwordChangedAt']
    })
    next()
})
// AGGREGATION MIDDLEWARE : runs before the aggregate command
// schema.pre('aggregate', function(next){
//     // adding a stage in the pipeline that hides secret tours
//     this.pipeline().unshift({$match : {secretTour: {$ne: true}}})
//     next()
// })
// creating the model
const Model = mongoose.model('tours', schema) // tours is the collection that will be created if it doen't exist before.

// exporting our model for documents to be created, updated or delted.
module.exports = Model;
