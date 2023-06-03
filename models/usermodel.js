const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const crypto = require('crypto')
// defining a schema for users
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        unique: true,
        trim: true
    },
    password: {
        type:String,
        required: [true, 'A user must have a password'],
        minLength: 8,
        select: false
    },
    photo:{
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    email: {
        type: String,
        validate: [validator.isEmail],
        required: [true, 'A user must have an email'],
        unique: true,
        loweracse: true,
        maxLength: 20,
        minLength: 10
    },
    passwordConfirm: {
        type: String,
        required: true,
        // checking if the password is the same as passwordConfirm.
                // Only works for create or save operations
        validate: {
            validator: function(el){
                return el === this.password
                // if false returns an error
            },
            message: 'passwords are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    confirmationToken: String,
    confirmationTokenExpires: Date
},)
// plain passwords or sensetive informations should not be stored in the database.
// so we need to encrypt the password right before it is saved in the databse. and for that we use a pre middleware
userSchema.pre('save', async function(next){
    // we only want to encrypt the passwords if they are modefied(created or updated).
    if(!this.isModified('password')) return next()
    // bcrypt is a popular password-hashing library that is used to store passwords securely in a database.
    this.password = await bcrypt.hash(this.password, 12)  // 12 determines the complexity of the hash.
    // deleting passwordConfirm, we only wanted it for validation purpose
    this.passwordConfirm = undefined
})
// A middleware to set a new property called PasswordChangedAt after the user has changed thier password.
userSchema.pre('save', function(next){
    // check if the password is changed and it's not because of new document creation
    if(!this.isModified('password') || this.isNew) return next() // pass, do nothing
    this.passwordChangedAt = Date.now() - 1000
    next()
})
// A query middleware that filters only active users
userSchema.pre(/^find/g, function(next) {
    // filter out non active users
    this.find({active: {$ne: false}})
    next()
})
// An instance method is available on all documents of a collection and used for specific kinds of tasks.
userSchema.methods.comparePasswords = async function(candidatepassword, userpassword){
    // returns true if the hash password saved into the database is exactly the same as the login password.
    return await bcrypt.compare(candidatepassword, userpassword)
}
// An Instance method to check if passowrd was changed
userSchema.methods.checkIfPasswordChanged = async function(TokenissuedAt){
    if(this.passwordChangedAt){
        const changedpasswordAt = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        // changedpasswordAt > tokenissuedAt returns true if password was changed.
        return changedpasswordAt > TokenissuedAt
    }
    // if the passwordChangedAt property doesn't exist, It means the user has never chnged thier password , so return false.
    return false
}
// An Instance method to generate email confirmation token
userSchema.methods.EmailConfirmationToken = async function(){
    // email confirmation token
    const confirmToken = crypto.randomBytes(32).toString('hex')
    // encrypting the confirmation token for security measure
    this.confirmationToken = crypto.createHash('sha256').update(confirmToken).digest('hex')
    this.confirmationTokenExpires = Date.now() + 30 * 60 * 1000
     // email confirmation token expires after 30 minutes.
    // returning the unencrypted confirmation token to be sent as email.
    return confirmToken
}
// An Instance method that generates a random string for reset token
userSchema.methods.ResetPasswordToken = async function(){
    // A special token that lets the user to reset thier password
    const resettoken = crypto.randomBytes(32).toString('hex')
    // Even the Reset token should never be stored in plain text in our databse, so it needs to be encrypted
    this.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // token expires after 10 minutes
    return resettoken
}
const userModel = mongoose.model('users', userSchema)
module.exports = userModel
