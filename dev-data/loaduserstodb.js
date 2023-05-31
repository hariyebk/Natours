const fs = require('fs')
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const userModel = require('./../models/usermodel')
dotenv.config({path: './config.env'})
const db = process.env.DATABSE_CONNECTION_STRING 
// 'mongodb+srv://hariyebk:haribkmongo@cluster0.ro5g03f.mongodb.net/natours'
// connecting to our database
mongoose.connect(db, {
    useCreateIndex: true,
    useFindAndModify: false
})
.then(con => console.log('connected to the database'))
.catch(err => console.log(`couldn't connect to the databse: ${err.message}`))
// reading the json file
const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'))
console.log(users)
// uploading to the database
const upload = async() => {
    try{
        await userModel.create(users)
        console.log('Data sucessfully loaded !!')
    }
    catch(err){
        console.log(`${err.message}`)
    }
}
// deleting pre-existing data in the database
const del = async() => {
    try{
        await userModel.deleteMany()
        console.log('No users in the database')
    }
    catch(err){
        console.log(`${err.message}`)
    }

}

del()
upload()