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

// populating refrences with actual data
reviewSchema.pre(/^find/, function(next){
    // A chain of populates reduces performance. that why we don't populate reviews with tours.
    this.populate({
        path: "user",
        select: 'name'
    })
    next()
})
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
    // update the ratingAverage and rating filed of the tour
    await Model.findByIdAndUpdate(tourId, {
        ratingAvarage: stats[0].avgRating,
        ratingQuantity: stats[0].nRatings
    })
    console.log(stats)
}
reviewSchema.post('save', function(){
        // this keyword points to the current review document
    // the current model can be accessed using this.constructor
    this.constructor.calcAverageRatings(this.tour)
})
// A chain of populates reduces performance

const reviewModel = mongoose.model('reviews', reviewSchema)
// export the model
module.exports = reviewModel