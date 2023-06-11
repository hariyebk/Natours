const mongoose = require('mongoose')
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
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'tours',
        required: [true, 'A review must have an Tour']
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
    this.populate({
        path: 'author',
        select: 'name'
    }).populate({
        path: "author",
        select: 'name'
    })
    next()
})

const reviewModel = mongoose.model('reviews', reviewSchema)
// export the model
module.exports = reviewModel