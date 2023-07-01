const nodemailer = require('nodemailer')
const pug = require('pug')
const htmltotext = require('html-to-text')
// create transporter
const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            // Our username and password for the email service.
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
})
module.exports = class email{
    constructor(user, url){
        this.to = user.email,
        this.firstName = user.name.split(' ')[0],
        this.url = url,
        this.from = process.env.EMAIL__FROM
    } 
    // transport(){
    //     // for production enviroment we send A real Email
    // if(process.env.NODE_ENV === 'production'){
    //     // send grid
    //     return 
    // }
    // // for development enviroment we use mail trap
    //   return nodemailer.createTransport({
    //     host: process.env.EMAIL_HOST,
    //     port: process.env.EMAIL_PORT,
    //     auth: {
    //         // Our username and password for the email service.
    //         user: process.env.EMAIL_USERNAME,
    //         pass: process.env.EMAIL_PASSWORD
    //     }
    // })

    // } 
    async send(template, subject){
        //1. Render HTML based on the pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })
        //2. define email option
        const mailoptions = {
            // What the email should look like when we send it
                from: this.from,
                to: this.to,
                subject,
                html,
                text: htmltotext.htmlToText(html)
        }
        //3. send email
        await transport.sendMail(mailoptions)
    }
    // To confirm email when a new user signs up to our app.
    async Welcome(){
        await this.send('welcome', 'welcome to the natours family')
    }
    // Email confirmation
    async confirmEmail(){
        await this.send('confirm', 'Confirm Your Email Address')
    }
    // reset password
    async resetpassword(){
        await this.send('passwordReset', 'Reset your password')
    }
}