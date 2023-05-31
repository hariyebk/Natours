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
    passwordResetExpires: Date
},)
// plain passwords or sensetive informations should not be stored in thwe database.
// so we need to encrypt the password right before it is saved in the databse. and for that we use a pre middleware
userSchema.pre('save', async function(next){
    // we only want want to encryptthe passwords if they are modefied(created or updated).
    if(!this.isModified('password')) return next()
    // bcrypt is a popular password-hashing library that is used to store passwords securely in a database.
    this.password = await bcrypt.hash(this.password, 12)  // 12 determines the complexity of the hash.
    // deleting passwordConfirm, we only wanted it for validation purpose
    this.passwordConfirm = undefined
})
// A middleware to set a new property called PasswordChangedAt after the user has changed thier password.
userSchema.pre('save', function(next){
    // check if the document is modefied and it's not because of new document creation
    if(!this.isModified('password') || this.isNew) return next() // pass, do nothing
    this.passwordChangedAt = Date.now() - 1000
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

// An Instance method that generates a random string
userSchema.methods.ResetPasswordToken = async function(){
    // A special token that lets the user to reset thier password
    const resettoken = crypto.randomBytes(32).toString('hex')
    // the token should never be stored in plain text in our databse, so it needs to be encrypted
    this.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // password expires after 10 minutes
    return resettoken
}
const userModel = mongoose.model('users', userSchema)
module.exports = userModel
