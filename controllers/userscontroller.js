const fs = require('fs')
const catchasync = require('../utils/catchAsyncErrors')
const userModel = require('../models/usermodel')
const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`))

//     exports.userchecker = (req, res, next, val) => {
//     const name = req.params.name
//     const user = users.filter(el =>(String(el.name).toLocaleLowerCase().replace(/\s+/g, '') === name))
//     if(!user) {
//     res.status(404).json({
//             "status": "fail",
//             "message": "User not found !!"
//     })
// }
//     next();
//     }
//  route handlers for user resources.
    exports.getallusers = catchasync( async (req, res, next) => {
        const USERS = await userModel.find()
        res.status(200).json({
            "status": "success",
            "results": USERS.length,
            "data": {
                USERS
            }
        })
    })
    exports.createuser = (req, res) => {
        const newuser = req.body;
        users.push(newuser)
        fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(users) ,err => {
            if(err) console.log(err.message)
            res.status(201).json({
                "status": "success",
                "data": newuser
            })
        })
    }
    exports.getuser = (req, res) => {
        const user = users.filter(el =>(String(el.name).toLocaleLowerCase().replace(/\s+/g, '') === req.params.name))
        res.status(200).json({
            "status": "success",
            "data": {
                user
            }
        })
    }
    exports.updateuser = (req, res) => {
    const name = req.params.name
    const newrole = req.body.role 
    console.log(newrole)
    const newemail = req.body.email
    console.log(newemail)
    const user = users.filter(el =>(String(el.name).toLocaleLowerCase().replace(/\s+/g, '') === name))
    user[0].role = newrole
    user[0].email = newemail
    users.forEach(el => {
        if(el.name === user[0].name){
        el.role = newrole
        el.email =  newemail
        }
    });
    fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(users) ,err => {
        if(err) console.error(err.message)
        res.status(201).json({
        "status": "success",
        "message": "user has been updated !!",
        "updated user": {
            user
        }
        })
    })
    }
    exports.deleteuser = (req, res) => {
    const name = req.params.name
    const user = users.filter(el =>(String(el.name).toLocaleLowerCase().replace(/\s+/g, '') === name))
    const id = users.findIndex(el => el.name === user[0].name)
    users.splice(id, 1)
    fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(users) ,err => {
        if(err) console.error(err.message)
        res.status(201).json({
        "status": "success",
        "message": "user has been deleted !!",
        "deleted user": {
            user
        }
        })
    })
    }