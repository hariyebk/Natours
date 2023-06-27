// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
const multer = require('multer')
// to get the file type from the mimetype
// const mime = require('mime-types')
// stroring the file to disk
    // const storage = multer.diskStorage({
    //     // where to store uploaded files
    //     destination: (req, file, cb) => {
    //     cb(null, './public/img/users')
    //     },
    //     // naming convention for uploaded file
    //     filename: (req, file, cb) => {
    //     // file comes from req.file
    //     const filetype = mime.extension(file.mimetype)
    //     cb(null, `user-${req.user.id}-${Date.now()}.${filetype}`)
    //     }
    // })


// It's better to store the uploaded image into the memory buffer for resizing and other manipulation
const storage = multer.memoryStorage()
// protecting unwanted data from being uploaded
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) cb(null, true)
    else cb(new appError('Not an image !! Please only upload a photo'), 400)
}
// setting up where the uploaded file should be stored. we don't store photots in our database. we store them in the image folder then the name of the photo is the one that's going to be stored in the database.
const upload = multer({storage, fileFilter})
module.exports = upload