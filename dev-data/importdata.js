const fs = require('fs')
const mongoose = require('mongoose')
const Model = require('../models/tourmodel')
const userModel = require('../models/usermodel')
const reviewModel = require('../models/reviewmodel')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const db = process.env.DATABSE_CONNECTION_STRING 
// connecting to our remote MongodbAtlas database using mongoose.
    // we first have to connect to our remote database in order to perform crud operations.
mongoose.connect(db, {
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    console.log('connected to the database')
    // lists all the available databases.
    // mongoose.connection.db.admin().listDatabases((err, result) => {
    //     console.log(result.databases);
    // })
}).catch(error => {
    console.log(`couldn't connect to the remote database : ${err.message}`)
})
const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8'))
// const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'))
// const reviews = JSON.parse(fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8'))

console.log('finished extarcting Data')
const upload = async () => {
    try{
        await Model.create(tours)
        // await userModel.create(users, {validateBeforeSave: false})
        // await reviewModel.create(reviews)
        console.log('Data successfully loaded !!')
    }
    catch(err){
        console.log(err.message)
    }
}
// deleting the existing data in the database before uploading our documents.
const deleted = async () => {
    try{
        await Model.deleteMany()
        // await userModel.deleteMany()
        // await reviewModel.deleteMany()
        console.log('Data Successfully deleted from the database')
    }
    catch(err){
        console.log(err.message)
    }
}
// process.argv : displays the path for the commands in the terminal.
if(process.argv[2] === '--upload') upload()
if(process.argv[2] === '--deleted') deleted()


