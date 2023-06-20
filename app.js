const express = require('express');
const morgan = require('morgan') // logger middleware
const toursrouter = require('./routes/toursRoutes')
const usersrouter = require('./routes/usersRoutes')
const reviewrouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const appError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorHandler')
const rateLimit = require('express-rate-limit')
const session = require('express-session')
const helmet = require('helmet')
const path = require('path')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')


const app = express();
// template engine: pug
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
// serving static files
app.use(express.static(path.join(__dirname, 'public')))
// helmet package sets various http headers to secure our application from most common web attacks like cross-site-forgery, cross-site-scripting ...etc
app.use(helmet())
// creating a middleware between the request and response to accces body of the request incase of a post request.
// middlewares
app.use(express.json({limit: '10kb'}));
// restricting the size of incoming payloads
 // parsing the request has to be the first middleware.

 // Data Sanitization Against: Nosql injection
app.use(mongoSanitize()) // removes mongodb query operation signs 

 // Data sanitization Against : Xss(cross-site scripting) attacks
app.use(xss())

// Prevent parameter pollution attacks from the query string  (ex. duplicte parameters)
app.use(hpp({
    // EXCULDE: sometimes we may want two or more of the same query parameters in the url
    whitelist: ['duration', 'ratingAvarage', 'ratingQuantity', 'maxGroupSize', 'difficulty', 'price']
}))

 // Request Limiter: To prevent Brute-Force and DDos Attacks
        // The user can only make 100 http requests per hour
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requets to handle. Try again later"
})
app.use('/api', limiter)

// Set up session middleware and store to limit maximum login attempts.
       // session-based login attempts tracking
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: false,
    store: null
}))
// custom middlwware 
// app.use((req, res, next) => {
//     req.requestedTime = new Date().toISOString()
//     // res.send('Request Response cycle exited !!')
//     // Reminder everything in express is a middleware (ex. route handler, parsing the request data from body), so thier order matters. if the previous middleware sends res.json() or res.send(), the the request response object passing will exit the tunnel (request response cycle) and other middlewares will not get excuted. unless the object is passed using next() function without exiting the tunnel.
//     next()
// })
// 3rd party middleware to logs HTTP requests and errors to the console
// only logs the HTTP request if the enviroment is developement.
// if(process.env.NODE_ENV === 'development') app.use(morgan('dev'))
// serving static files from a directory can pose a security risk if you allow clients to request arbitrary files from your server. Make sure to only serve files that you intend to be publicly accessible, and configure your server to restrict access to sensitive files or directories.Instead of serving files from the root directory of your application, you can serve them from a subdirectory and specify a root URL path for the middleware. This can help to limit access to the files and prevent clients. from requesting files outside of the designated directory. example- app.use('/public', express.static('files'));
// In this example, files in the files directory will only be served if they are requested with a URL path that starts with /public, like 
//http://localhost:3000/public/image.jpg
// ******* /////

//serving static files from a directory using the builtin express.static() middleware.
// app.use(express.static(`${__dirname}/public`))
// a middleware similar to morgan.
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.originalUrl} ${res.statusCode} `)
//     next()
// })
// routing -> defining how our server should react to specific types of incoming requests.
// app.get('/', (req, res) => {
//     res.status(404).json({message: 'hello from the server !!', app: 'natours'})
// })
// app.post('/', (req, res) => {
//     res.send('You can now post anything to this endpoint !!')
// })
// reading the tours file from our json data

// mounting the routers for sub paths

// A Route for rendering the page
app.use('/api/v1/tours', toursrouter)
app.use('/api/v1/users', usersrouter)
app.use('/api/v1/reviews', reviewrouter)
app.use('/', viewRouter)

// handling unhandled routes
        // only works if all the above middleware can't catch the request. so it means it's a wrong path.
app.all('*', (req, res, next) => {
    // passing a custom error instance from the appError class to the global error handler.
    next(new appError(`Can't get ${req.originalUrl} on this server !!`, 404))
})
// Global error handling middleware. all errors that happen jump into this middleware.
app.use(globalErrorHandler)
module.exports = app