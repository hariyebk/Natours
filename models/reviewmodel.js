const mongoose = require('mongoose')
const Model = require('./tourmodel')
const reviewSchema  = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review must not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 4.5,
        set: val => Math.round(val * 10) / 10
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // parent referencing
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'tours',
        required: [true, "A review must have a Tour "]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: [true, 'A review must have an author']
    }
}, {
    toJSON:{
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})
// compound index: A user can review a tour only once
reviewSchema.index({tour: 1, user: 1}, {unique: true})

// populating refrences with actual data
reviewSchema.pre(/^find/, function(next){
    // A chain of populates reduces performance. that why we don't populate reviews with tours.
    this.populate({
        path: "user",
        select: 'name photo'
    })
    next()
})
// when a new review is created the average rating should be recalculated
// static method : this method points to the current model But in an instance method this keyword points to the current document.
reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await reviewModel.aggregate([
        // stages
        {
            // filter reviews by their corresponding tour
            $match: {tour: tourId},
        },
        {
            //grouping documents
            $group:
            {
                // based on what field we want to group.
                _id: '$tour',
                    // feilds to be returned
                // increase the number of rating everytime a new review is posted
                nRatings: {$sum: 1},
                // calculate the average rating
                avgRating: {$avg: '$rating'}
            }

        }
    ])
    // update the ratingAverage and rating filed of the tour if there are reviews
    if(stats.length > 0){
        await Model.findByIdAndUpdate(tourId, {
            ratingAvarage: stats[0].avgRating,
            ratingQuantity: stats[0].nRatings
        })
    }
    else{
        await Model.findByIdAndUpdate(tourId, {
            // default values
            ratingAvarage: 4.5,
            ratingQuantity: 0
        })
    }
}
// save the newly calculated average ratings into the database.
reviewSchema.post('save', function(){
        // this keyword points to the current review document
    // the current model can be accessed using this.constructor
    this.constructor.calcAverageRatings(this.tour)
})
//when a review is updated or deleted , the average rating should be recalculated
reviewSchema.pre(/^findOneAnd/, async function(next){
    // works for both: findByIdAndUpdate and findByIdAndDelete
    // In a query middleware this key word ponits to the current query object, for doucment middleware this key word points to the current document. so to excute the calcAverageRatings static method we have to get the tourId from the documnt. But we are using a pre middleware, we can't access the updated document in the database, so the average rating calculation will not be correct. to solve this problem we create a new property called r on the query object to pass the current document for the post middleware because we can't use calcAverageRatings method on pre middleware and we can't also use  await this.findOne() on the post middleware because the query has already been excuted.
        // returns the target document to be updated or deleted 
    this.r = await this.findOne()
    
    next()
})
reviewSchema.post(/^findOneAnd/, async function(){
    // this.r = await this.findOne(): Does not work here. query has excuted.
    await this.r.constructor.calcAverageRatings(this.r.tour)
})
// A chain of populates reduces performance

const reviewModel = mongoose.model('reviews', reviewSchema)
// export the model
module.exports = reviewModel