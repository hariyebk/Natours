const mongoose = require('mongoose')
const bookingSchema = new mongoose.Schema({
    // parent referencing
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'tours',
        required: [true, "A Booking must have a Tour "]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: [true, 'A Booking must have an user']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a Price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
    
}) 
// populating refrences with actual data
// bookingSchema.pre(/^find/, function(next){
//     this.populate({
//         path: 'tour',
//         select: ['name', 'id']
//     }).populate({
//         path: 'user',
//         select: ['name', 'id']
//     })
//     next()
// })

const bookingModel = mongoose.model('bookings', bookingSchema)

module.exports = bookingModel