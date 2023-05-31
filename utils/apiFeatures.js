// Refactoring our api features like sorting , filtering , limiting fields into one class so that we can choose which api feature we want to use.
class apiFeatures {
    constructor(queryObj,queryString){
        this.queryObj = queryObj;
        this.queryString = queryString
    }
    // 1. Filtering featiure for our api.
    filter(){
        // creating a shallow copy of the query object
            //We exclude certain field names like page, limit, and fields because they are not part of the query criteria for the MongoDB find() method. These fields typically represent options for pagination, limiting and sorting the number of results, and selecting specific fields to return. Excluding these fields ensures that the query criteria only includes the fields that are relevant for filtering the data.
            const obj = {...this.queryString}
            const excludedfields = ['sort', 'page', 'limit', 'fields']
            excludedfields.forEach(el => delete obj[el])
            //1. for simple queries like duration=5 or difficulty = easy, we just has to pass the req.query object into the find method.
             //2.  for advanced queries like gt,gte,lt,lte.
            const modifiedqueryString = JSON.stringify(obj).replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
            // queryObj is first an empty queryObj created from the Model.find() method and now it is a query object that holds documents that satisfy the modifiedqueryString. 
            this.queryObj = this.queryObj.find(JSON.parse(modifiedqueryString))
            // if none of the options or operations were present in the queryString then it returns the entire documets to the queryObj property.
            return this
    }
    // 2, sorting
    sort(){
        if(this.queryString.sort){
            // The sort() method takes an object as its argument, where the keys represent the fields to sort by and the values represent the sort order (1 for ascending and -1 for descending).
            // if two or more documents have the same price.
            const sortingcriterias = this.queryString.sort.split(',').join('')
             // the sort method in mongoose expects an object.
            // but in order to use the queryObj with the sort method, it has to be filtered. 
            this.queryObj = this.queryObj.sort({[sortingcriterias]: 1}) // -1 for ascending order and 1 for descending order.
        }
        else{
            this.queryObj = this.queryObj.sort({['createdAt']: -1})
        }

        return this
    }
    //3. Limiting fields in order to reduce the bandwidth and only sending relevant data to the client.
    limit(){
        if(this.queryString.fields){
            const limits = this.queryString.fields.split(',').join(' ')
            // the select method in mongoose expects strings with spaces.
            this.queryObj = this.queryObj.select(limits)
        }
        else{
            // exculding the __v field that's added by mongoose by default.
            this.queryObj = this.queryObj.select('-__v')
        }
        return this
    }
    // 4. pagination
    page(){
            // When a user makes an http request to access the documents from the databse, we shoul not overwhelm the user by displaying huge junk of documents. so we divide them into pages.
            const page = +this.queryString.page || 1 // assigning default values
            const limit = +this.queryString.limit || 100
            const skipped = page*limit-limit // number of documents to be skipped.
            // if the user tries to access beyond the page limit
            // if(this.queryString.page){
            //     const total = await Model.countDocuments()
            //     if(skipped >= total ) throw new Error('This page does not exist')
            // }
            this.queryObj = this.queryObj.skip(skipped).limit(limit)
            return this
    }
}
module.exports = apiFeatures