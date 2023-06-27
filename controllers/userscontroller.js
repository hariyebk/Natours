const catchAsync = require('../utils/catchAsyncErrors')
const userModel = require('../models/usermodel')
const helper = require('../utils/helpers')
const appError = require('../utils/appError')
const handlers = require('./handlerFactory')
// sharp: image proccessing package for nodejs
const sharp = require('sharp')
const upload = require('../utils/multer')
    //  route handlers for user resources.
// uploadPhoto is a middleware that handles file uploads and adds a file object in the req object.
exports.uploadPhoto = upload.single('photo')
// A middleware to process the uploaded image
exports.resizeUploadedPhoto = catchAsync( async (req, res, next) => {
    if(!req.file) return next()
    // redefining the name of the file.
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    // we want the image to be square : height and width should be equal
    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpg')
    .jpeg({quality: 90})
    .toFile(`./public/img/users/${req.file.filename}`)

    next()
})
exports.getallusers = handlers.findalldoc(userModel)
exports.getuser = handlers.finddoc(userModel)
exports.deleteuser = handlers.deletedoc(userModel)
exports.updateuser = handlers.updatedoc(userModel)
exports.updateMe = catchAsync( async (req, res, next) => {
        // 1. if the user sent password or passwordConfirm instead of other user data
        if(req.body.password || req.body.passwordConfirm) return next(new appError('This route is not for updating password', 400))
        // We have to be causious when recieving data from the user. it can contain unwanted fields like role: "admin"
        const filteredBody = helper.filterObj(req.body, 'name' , 'email')
        // if the user uploads a photo, upadte the databse 
        if(req.file) filteredBody.photo = req.file.filename
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
exports.deleteMe = catchAsync( async (req, res, next) => {
        // Get and deactivate user
        await userModel.findByIdAndUpdate(req.user.id, {active: false})
        // send response
        res.status(204).json({
            status: "success",
            message: null
    })
})
exports.getme = (req, res, next) => {
    req.params.id = req.user.id
    next()
}