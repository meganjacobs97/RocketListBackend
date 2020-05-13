const userResolver = require("./userResolver.js"); 
const postResolver = require("./postResolver.js"); 
const categoryResolver = require("./categoryResolver.js"); 
const replyResolver = require("./replyResolver.js"); 
const subcategoryResolver = require("./subcategoryResolver.js")

//rootValue is a bundle of all our resolvers 
//must have a resolver of the same name for each query 
//the resolver will be called with each request  from the frontend 
const rootValue = {
    ...userResolver,
    ...postResolver, 
    ...categoryResolver, 
    ...replyResolver,
    ...subcategoryResolver
}

//export resolvers 
module.exports = rootValue; 