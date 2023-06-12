const catchasync = require('../utils/catchAsyncErrors')
const userModel = require('../models/usermodel')
const helper = require('../utils/helpers')
const appError = require('../utils/appError')
const handlers = require('./handlerFactory')

//  route handlers for user resources.
exports.getallusers = catchasync( async (req, res, next) => {
        const users = await userModel.find()
        res.status(200).json({
            "status": "success",
            "results": users.length,
            "data": {
                users
            }
    })
})
exports.getuser = catchasync( async (req, res, next) => {
    const user = await userModel.findById(req.params.id)
    if(!user) return next(new appError('No user found with this id', 404))
    res.status(200).json({
        status: "success",
        data: {
            user
        }

    })
})
exports.deleteuser = handlers.deleteOne(userModel)
exports.updateMe = catchasync( async (req, res, next) => {
        // 1. if the user sent password or passwordConfirm instead of other user data
        if(req.body.password || req.body.passwordConfirm) return next(new appError('This route is not for updating password', 400))
        // We have to be causious when recieving data from the user. it can contain unwanted fields like role: "admin"
        const filteredBody = helper.filterObj(req.body, 'name' , 'email')
        // Get and update user data
        const updatedUser = await userModel.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
    })
        // send response
        res.status(201).json({
            status: "success",
            data: {
                updatedUser
            }
    })
})
exports.deleteMe = catchasync( async (req, res, next) => {
        // Get and deactivate user
        await userModel.findByIdAndUpdate(req.user.id, {active: false})
        // send response
        res.status(204).json({
            status: "success",
            message: null
    })
})