const nodemailer = require('nodemailer')
const sendemail = async options => {
         //1. create transporter

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            // Our username and password for the email service.
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // Activate less secure options in Gmail
    })
        //2. define email option
    const mailoptions = {
        // What the email should look like when we send it
            from: "Harun Bekri <harunbekri6@gmail.com>",
            to: options.email,
            subject: options.subject,
            text: options.message
    }

       //3. send email
    await transporter.sendMail(mailoptions)
}

module.exports = sendemail