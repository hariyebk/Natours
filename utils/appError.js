// creating custom error class by extending the built-in Error class. this will  provide more specific error handling and a readable code.
class appError extends Error{
    constructor(message, statusCode){
        // the constructor accepts two arguments: message and status code.
             // The Error class constructor expects an error message
        super(message) // calls the Error class constructor with the message argument.
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isoperational = true
        Error.captureStackTrace(this, this.constructor) // By attaching the stack trace to the error object, we can provide more information about the context in which the error occurred.
    }
}

module.exports = appError