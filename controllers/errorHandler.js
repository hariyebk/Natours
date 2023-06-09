const appError = require('./../utils/appError')
// a function to Include Cast Errors generated by mongoose as Operational errors.
const handleCastError = err => {
    const message = `Invalid ${err.path} : ${err.value}`
    return new appError(message, 400) // 400: Bad Request
}
const handleDuplicateError = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    // console.log(value)
    const message = `Duplicate key error: ${value}. Please try another field`
    return new appError(message, 400)
}
const handleValidationError = err => {
    // If more than one validation error occured
    const errors = Object.values(err.errors).map(el => el.message)
    const message = ` Invalid Input data: ${errors.join('. ')} `
    return new appError(message,400)
}
const handleJsonWebTokenError = () => new appError(`Access denied. Sign up or Log in to get access`, 401)
const handleTokenExpiredError = () => new appError('Your Token has expired. please try to login again', 401)
// In developement enviroment we want more information about the errors that happened.
const sendErrorDev = (err, req, res) => {
     // if the error happend while using our api, we don't need to display A user friendly error template.
    if(req.originalUrl.startsWith('/api')){
        res.status(err.statusCode || 500).json({
            status: err.status || 'error',
            error: err,
            stackTrace: err.stack,
            message: err.message
        })
    }
    // if the error occured on the browsser, we need to display a user friendly Error message.
    else{
        res.status(500).render('error', {
            title: 'something went wrong !!',
            message: err.message
        })
    }
}
// In Production enviroment the client should see a simple and user friendly error.
const sendErrorPord = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')){
        // for operational errors
        if(err.isoperational){
                res.status(err.statusCode || 500).json({
                    status:  err.status || 'error',
                    message: err.message
                })
            }
         // for programming or other unkown errors: don't leak error details, just say something nice and easy.
        else{
            // console.log(err)
            res.status(500).json({
                status: 'Error',
                message: 'Something went wrong !!'
            })
        }
    }
    else{
        // Browsser
            if(err.isoperational){
                res.status(err.statusCode).render('error', {
                    title: 'something went wrong !!',
                    message: err.message
                })
            }
            else{
                return res.status(err.statusCode).render('error', {
                    title: 'something went wrong !!',
                    message: 'Please try again later !!'
                })
            }
    }
}
module.exports = (err, req, res, next) => {
    // for development enviroment
    
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res)
    }
    // for production enviroment
    if(process.env.NODE_ENV === 'production'){
        // creating a shallow copy of the error object
        let error = err
        // A CastError occurs when Mongoose is trying to cast a value to a specific data type, but the value is incompatible with that data type or when it can't find the data that matches the query.
        if(error.name === "CastError") error = handleCastError(error)
        // Cast Errors should be operational errors 
        // for duplicate field errors
        if(error.code === 11000) error = handleDuplicateError(error)
        // for validation errors
        if(error.name === 'ValidationError') error = handleValidationError(error)
        // for invalid signetures
        if(error.name === 'JsonWebTokenError') error = handleJsonWebTokenError()
        // for expired tokens
        if(error.name === 'TokenExpiredError') error = handleTokenExpiredError()
        sendErrorPord(error, req, res)
    }  
}
// since we passed 4 argumets , express will automatically think that it is an error handling middleware. so when any routeHandler or middleware throws an error as next(err), it will be catched in this global error handling middleware.