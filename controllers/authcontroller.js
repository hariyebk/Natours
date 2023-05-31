const userModel = require('./../models/usermodel')
const  catchasync = require('./../utils/catchAsyncErrors')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const appError = require('./../utils/appError')
const sendemail = require('../utils/email')

const signToken = id => {
    // creating the json web token for the specific user
    // jwt.sign(header, payload, {options})
    return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
} ) // token header will be created automatically.
}
const GenerateToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    // Logging users as soon as they sign up
    res.status(statusCode).json({
        status: 'success',
        // sending the jwt for the user.
        token,
        data: {
            user
        }
    })
}
// Authentication process

// signing up new users
exports.signup = catchasync( async (req, res, next) => {
    // const newuser = await userModel.create(req.body)
    // security flaw: every user can identify thier role as admin when they signup.
    const newuser = await userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    })
    // jwt token 
    GenerateToken(newuser, 201, res)
})
// logging user
exports.login = catchasync( async (req, res, next) => {
    const {email, password} = req.body
    // check if email and password exist
    if(!email || !password) {
        return next(new appError('please provide A valid email and password !!') )
    }
    // check if the user exists and the password is correct
    const user = await userModel.findOne({email}).select('+password')
    if(!user || !await user.comparePasswords(password, user.password)){
        // When handling authentication errors, it is generally considered good practice to return a generic error message such as "Incorrect username or password" instead of specifying which part of the authentication process failed (e.g. "Invalid username" or "Incorrect password").The main benefit of returning a generic error message is that it can help prevent potential security vulnerabilities. If an attacker is trying to gain unauthorized access to a system, they may use various techniques such as brute force attacks to guess a user's username and password. By returning a generic error message, you are not providing any additional information that could help the attacker narrow down their guesses. On the other hand, if you return a specific error message such as "Invalid username", the attacker now knows that the username they guessed was incorrect and can focus their efforts on guessing a different username.
        return next(new appError('Incorrect email or password', 401))
    }
    // if everything is ok, send token
    GenerateToken(user, 200, res)
})

// verifing logged in users for protected routes
exports.protect = catchasync(async ( req, res, next) => {
    let token
    //1. check if token exits within the request
        if(
            req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer'))
        {
            token = req.headers.authorization.split(' ')[1]

        }
        if(!token){
            return next(new appError('Sign up or Log in to get access', 401))
        }
    //2. check for verified signeture (not expired or invalid)
            // Promisifying the jwt.verify function using util.promisify() is not strictly necessary in this case
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        // returns the payload of the token
        
    //3. check if user still exits (if account is not deleted or token's payload is not changed by a 3rd party)
    const currentuser = await userModel.findById(decoded.id)
    if(!currentuser) next(new appError('User not found. Make sure you have an active account', 401))

    //4. check if the user has chaged their password after the token has been issued.
    if(await currentuser.checkIfPasswordChanged(decoded.iat)){
        next(new appError('Password has been changed, Try to login agian'))
    }
    
    // finally grant access to protected route by passing the user for the next middleware
    req.user = currentuser
    next()
})

exports.forgotPassword = catchasync( async (req, res, next) => {
    // check if user exists
    const user = await userModel.findOne({email: req.body.email})
    if(!user) next(new appError('There is no user with thise email', 404))
    // generate A random reset token
    const resetToken = await user.ResetPasswordToken()
    // saving the encrypted request token and its expire date into our database
    await user.save({validateBeforeSave: false})
    // reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `To create your new password: Go to this link ${resetUrl}`
    // If sending the email fails for some reason we have to unset the passwordResetToken and passwordResetExpires property of the user in the database. but we can't do this if we used the catchAsyc function. we need a new try catch block
    try{
        // sending the email
        await sendemail({
            email: req.body.email,
            subject: 'Your password reset token',
            message
        })
        // sending response
        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        })
    }
    catch(err){
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        // to be persistant in the database
        await user.save({validateBeforeSave: false})
        return next(new appError('There was an error sending the email. Try again later', 500))
    }
    
})

exports.resetPassword = catchasync( async (req, res, next) => {
    // 1. Encrypting the unencrypted token that we sent on the url by email to compare with passwordResetToken property on the database to identify which user is to change thier password.
    const hashedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    // filter a user who's passwordResetToken property matches the token in the url and it's password has not expired.
    const user = await userModel.findOne({
        passwordResetToken: hashedtoken,
        passwordResetExpires: {$gt: Date.now()
        }
    })
    if(!user) return next(new appError('Token has expired'))
    // change the password 
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    // persist changes in the database
         // we want the validator to check if the password and passwordConfirm actually match
    await user.save() 
    // log in user
    GenerateToken(user, 200, res)
})

exports.updatePassword = catchasync( async (req, res, next) => {
    // 1. Get user 
    const user = await userModel.findById(req.user.id).select('+password')
})
// Authorization process
        // Not all logged in users should have equal previlage.
exports.authorized = (req,res, next) => {
    // check if the user is admin or lead-guide
    if(req.user.role !== 'admin' || req.user.role !== 'lead-guide'){
        return next(new appError(`You do not have the permission to perform this action`, 401))
    }
    next()
}