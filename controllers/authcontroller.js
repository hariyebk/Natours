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
    // A cookie is just a small piece of string sent from the server. for future requets from the same server it will be sent with the request together. Every connection between the server and the client should be held by https only.
    const cookieOptions = {
        expires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    // Our jwt should only be stored in httpOnly cookie in the browser to prevent cross site scripting attacks ( A hacker injects a malicious script into our application to Get access in to the local storage in the browser which holds jwt tokens. it's essential to store such kinds of sensetive informations in httpOnly cookies. so that the browser can't modify it)
    // sending jwt via cookie
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true
    res.cookie('jwt', token, cookieOptions)
    // Logging users as soon as they sign up
    res.status(statusCode).json({
        status: 'success',
        token,
        // sending the jwt for the user.
        data: {
            user
        }
    })
}
// Authentication process

// signing up new users
exports.signup = catchasync( async (req, res, next) => {
    // Limiting what we should recieve from the req.body for security measure.
    const newuser = await userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    })
    // Generate email confirmation token
    const confirmToken = await newuser.EmailConfirmationToken()
    // update database
    await newuser.save({validateBeforeSave: false})
    // returns the token and sets confirmationToken and confirmationTokenExpires properties on the newuser.
    const confirmationUrl = `${req.protocol}://${req.get('host')}/api/v1/users/confirmEmail/${confirmToken}`
    const message = `click the following link to confirm your email ${confirmationUrl}`
    // send email
    try{
        await sendemail({
            email: req.body.email,
            subject: 'confirm your email',
            message
        })
        // sending the response
        res.status(201).json({
            status: "success",
            message: "please confirm your email address by clicking the link sent to your email"
        })

    }catch(err){
        // if sending the email fails for some reason
        newuser.confirmationToken = undefined
        newuser.confirmationTokenExpires = undefined
        newuser.active = false
        //update the database
        await user.save({validateBeforeSave: false})
        return next(new appError('There was a problem sending your confirmation link. please try again'))
    }
})

// confirm new user
exports.confirmEmail = catchasync( async (req, res, next) => {
    // encrypting the token sent to the email to compare with thhe confirmationToken in the database.
    const hashedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    // check if the confirmation link has not expired
    const user = await userModel.findOne({
        confirmationToken: hashedtoken,
        confirmationTokenExpires: {$gt: Date.now()}
    })
    if(!user){
        // removing the new user if their confirmation link has expired.
        await userModel.deleteOne({confirmationToken: hashedtoken})
        return next(new appError('Your confirmation link has expired. Try again'))
    }
    // activate the user as legit
    user.confirmationToken = undefined
    user.confirmationTokenExpires = undefined
    // activate user
    user.active = true,
    // update the database
    await user.save({validateBeforeSave: false})
    // log in user
    // jwt token 
    GenerateToken(user, 201, res)
})
// logging user
exports.login = catchasync( async (req, res, next) => {
    // Accepting only the email and pssword from req.body As security measure
    const {email, password} = req.body
    // check if the user has exceeded the maximum login attempts
    const {loginAttempts} = req.session
    if(loginAttempts > 10){
        return res.status(409).json({
            status: 'fail',
            message: 'Too many login attempts. Try again later.'
        })
    }
    // check if email and password exist
    if(!email || !password) {
        return next(new appError('please provide A valid email and password !!') )
    }
    // check if the user exists and the password is correct
    const user = await userModel.findOne({email}).select('+password').select('+active')
    // || !await user.comparepasswords(password, user.password)
    if(!user || !await user.comparepasswords(password, user.password)){
        // When handling authentication errors, it is generally considered good practice to return a generic error message such as "Incorrect username or password" instead of specifying which part of the authentication process failed (e.g. "Invalid username" or "Incorrect password").The main benefit of returning a generic error message is that it can help prevent potential security vulnerabilities. If an attacker is trying to gain unauthorized access to a system, they may use various techniques such as brute force attacks to guess a user's username and password. By returning a generic error message, you are not providing any additional information that could help the attacker narrow down their guesses. On the other hand, if you return a specific error message such as "Invalid username", the attacker now knows that the username they guessed was incorrect and can focus their efforts on guessing a different username.

        // increase the login attempt by one because the user has failed to log in.
        req.session.loginAttempts = loginAttempts + 1
        return next(new appError('Incorrect email or password', 401))
    }
    if(user.active === false) return next(new appError('This user has been deleted'))
    // if everything is ok, send token
    req.session.loginAttempts = 0
    GenerateToken(user, 200, res)
})

// verifing logged in users for protected routes
exports.protect = catchasync(async ( req, res, next) => {
    // everytime the user vists some route , he should send his jsonwebtoken within the request object. then we make sure that the user exists in our database.
    let token
    //1. check if token exits within the request made from the api or 
        if(
            req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer'))
        {
            token = req.headers.authorization.split(' ')[1]
        }
        // 2. check if token exits within the request cookie from the browsser
        else if(req.cookies.jwt){
            token = req.cookies.jwt
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
    if(!currentuser) next(new appError('User not found.', 401))

    //4. check if the user has chaged their password after the token has been issued.
    if(await currentuser.checkIfPasswordChanged(decoded.iat)){
        next(new appError('Password has been changed, Try to login agian'))
    }
    // finally grant access to protected route by passing the user for the next middleware
    req.user = currentuser
    next()
})

// check if the user has logged in and dynamically change the user interface
exports.isLoggedIn = catchasync(async ( req, res, next) => {
    // everytime the user vists some route , he should send his jsonwebtoken within the request object. then we make sure that the user exists in our database.
    let token
    //1. check if token exits within the request made from the api or 
        if(
            req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer'))
        {
            token = req.headers.authorization.split(' ')[1]
        }
        // 2. check if token exits within the request cookie from the browsser
        else if(req.cookies.jwt){
            token = req.cookies.jwt
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
    if(!currentuser) next(new appError('User not found.', 401))

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
            // The user has signed up before But they forgot thier password.
    const user = await userModel.findOne({email: req.body.email})
    if(!user) next(new appError('There is no user registered with this email, Please provide the correct email', 404))
    // generate A random reset token
    const resetToken = await user.ResetPasswordToken()
            // returns a random resetToken and adds new properties passwordResetToken and passwordResetExpires
    // saving the encrypted request token and its expire date into our database
    await user.save({validateBeforeSave: false})
    // reset url to send email to the user
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `To create your new password: Go to this link ${resetUrl}`
    // If sending the email fails for some reason we have to unset the passwordResetToken and passwordResetExpires property of the user in the database. but we can't do this if we used the catchAsyc function. we need a new try catch block
    try{
        // sending the email
        await sendemail({
            email: req.body.email,
            subject: 'Your password reset token',
            message
            // we can insert an html code to be displayed for the user in the email
        })
        // sending response
        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        })
    }
    catch(err){
        // If sending the email fails for some reason
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        // updating the database
        await user.save({validateBeforeSave: false})
        return next(new appError('There was an error sending the email. Try again'))
    }
    
})

exports.resetPassword = catchasync( async (req, res, next) => {
    // 1. Encrypting the unencrypted token that we sent on the url by email to compare with passwordResetToken property on the database to identify if the user owns thier email they provided.
    const hashedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    // filter a user who's passwordResetToken property matches the token in the url and it's password has not expired.
    const user = await userModel.findOne({
        passwordResetToken: hashedtoken,
        passwordResetExpires: {$gt: Date.now()
        }
    })
    if(!user){
        req.user.passwordResetToken = undefined
        req.user.passwordResetExpires = undefined
        return next(new appError('It took you too long to change your password, Try again', 400))
    }
    // Accepting the new password from the form and changing it in the database.
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    // update the database
         // we want the validator to check if the password and passwordConfirm actually match in this case.
    await user.save() 
    // log in user
    GenerateToken(user, 200, res)
})

exports.updatePassword = catchasync( async (req, res, next) => {
    // 1. Get user from req.user 
    const user = await userModel.findById(req.user.id).select('+password')
    // 2. compare current password with the original 
            // the user knows thier original password in this case and they want to change it.
    if(! await user.comparepasswords(req.body.currentPassword, user.password)) return next(new appError(`Current password doesn't macth the original password. try again !!`, 400))
    //3. update the password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    //4. update database
            // We want the mongoose validator to check if password and passwordConfirm are the same.
    await user.save()
    // 5. log in user again
    GenerateToken(user, 200, res)
})

//Authorization process
        // Not all logged in users should have equal previlage.
exports.authorized = ( ...roles) => {
    return (req, res, next) => {
        // check if the user is admin or lead-guide
        if(!roles.includes(req.user.role)) return next(new appError(`You do not have the permission to perform this action`, 403))
        next()
    }
}