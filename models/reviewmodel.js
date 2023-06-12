const mongoose = require('mongoose')
const appError = require('../utils/appError')
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
    author: {
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
        path: "author",
        select: 'name'
    })
    next()
})
// A chain of populates reduces performance

const reviewModel = mongoose.model('reviews', reviewSchema)
// export the model
module.exports = reviewModel