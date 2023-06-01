// A function to limit req.body fileds
const filterObj = (obj, ...allowedfileds) => {
    const newobj = {}
    Object.keys(obj).forEach(el => {
        if(allowedfileds.includes(el)){
            newobj[el] = obj[el]
        }
    })
    return newobj
}
module.exports = filterObj