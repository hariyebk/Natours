const fs = require('fs')
const mongoose = require('mongoose')
const Model = require('../models/tourmodel')
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
const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours-sample.json`, 'utf-8'))
const uploadtours = async () => {
    try{
        await Model.create(tours)
        console.log('Data successfully loaded !!')
    }
    catch(err){
        console.log(err.message)
    }
}
// deleting the existing data in the database before uploading our documents.
const deletetours = async () => {
    try{
        await Model.deleteMany()
        console.log('tours delted from the database')
    }
    catch(err){
        console.log(err.message)
    }
}

// process.argv : displays the path for the commands in the terminal.
if(process.argv[2] === '--uploadtours') uploadtours()
if(process.argv[2] === '--deletetours') deletetours()


