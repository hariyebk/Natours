module.exports = fn => {
    // returning another anonymous function which will also return a resolved or rejected promise
    return (req, res, next) => {
        // calling the asyncronous function and it will return a promise
        fn(req,res,next).catch(err => next(err)) 
        // the Error thrown by the request handlers is not an instance of the appError class we created, so it does not have the property isoperational in it.
    }
}