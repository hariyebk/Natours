const catchAsyc = require('../utils/catchAsyncErrors')
// A function to limit req.body fileds
exports.filterObj = (obj, ...allowedfileds) => {
    // ...allowedfields => REST operator
    const newobj = {}
    Object.keys(obj).forEach(el => {
        if(allowedfileds.includes(el)){
            newobj[el] = obj[el]
        }
    })
    return newobj
}
