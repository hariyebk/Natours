// One of the main advantages of using environment variables is that they can be securely stored outside of your application code. This means that sensitive information such as API keys, database passwords, and other credentials are not stored in plain text in your codebase. Instead, they are stored as environment variables, which can be set separately and securely on the server or hosting environment where your Node.js application is running.The dotenv module loads our enviroment variables defined in the .env file into process.env, so we can access them .
const mongoose = require('mongoose')
const dotenv = require('dotenv')
// taking care of bugs (programming errors) that might happen all over our modules.

//TODO: TODO: TODO:
// process.on('uncaughtException', err => {
//     console.log('uncaught exception: shutting down...')
//     console.log(err.name, err.message, err.stack)
//     process.exit(1)
// })
dotenv.config({path: './config.env'}) // setting our enviroment variables into nodejs.
const app = require('./app')
const db = process.env.DATABSE_CONNECTION_STRING 
// connecting to our remote MongodbAtlas database using mongoose.
mongoose.connect(db, {
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    console.log('connected to the database')
    // lists all the available databases.
    // mongoose.connection.db.admin().listDatabases((err, result) => {
    //     console.log(result.databases);
    // })
}).catch(err => console.log('Database connection failed.'))
const port = process.env.PORT // setting port number from enviroment variables.
// console.log(process.env.NODE_ENV) // logs in which enviroment we are working on.
// starting the server.
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
// taking care of unhandled asynchrnous promise rejections that we might have forgotten to catch them. (like failed database connection) by listening for these specific events.
process.on('unhandledRejection', err => {
    console.log('Database connection failed. app is shutting down ...')
    console.log(err.name, err.message)
    // turning off the application gracefully
            // waits for ongoing requests to finish, then shuts down
    server.close(() => {
        process.exit(1)
        // 0 : for success
        // 1 : for uncaught exception
    })
})
// enviroment variable set by express
// console.log(app.get('env'))
// console.log(process.env) displays all the enviroment variables stored in the system.