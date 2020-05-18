//import mongoDB models 
const db = require("../../models"); 

const categoryResolver = {
    RootQuery: {
        //GETS A SINGLE CATEGORY - WORKING 
        category: (parent, args) => {
            return db.Category.findOne({_id:args.id}).then(category=> {
                if(category) {
                    return {...category._doc}; 
                }
                else {
                    return null; 
                }          
            })
            .catch(err => {
                console.log(err); 
                throw err; 
            })

        },
        //GETS ALL CATEGORIES - WORKING 
        categories: (parent, args) => {
            //return here so graphql knows we are doing something async and wont return until done 
            return db.Category
            //TODO: specify args in the {} for the data we want back
            .find({}).then(categories => {
                if(categories) {
                    //map so that we're not returning all the metadata
                    //have to convert the id to a string otherwise we will get an error (TODO: maybe we dont need to do this)
                        return categories.map(category => {
                        return {...category._doc, 
                            //_id: post.id
                            //date_created: new Data(post._doc.date_created).toISOString(); 
                        }
                    })
                }
                else {
                    return null; 
                }
                
            }).catch(err => {
                console.log(err); 
                throw err; 
            })
        }
    },
    RootMutation: {
        //CREATES A CATEGORY - WORKING 
        //this query probably wont be hit outside of development (unless categories are added in the future)
        createCategory: (parent, args, req) => {
            //create 
            const newCategory = new db.Category({
                name: args.categoryInput.name,
                description: args.categoryInput.description
            })
            
            //store category to database 
            return db.Category.create(newCategory).then(result => {
                //result refers to the post that we just created 
                console.log(result);
                //...result._doc returns result without all the associated metadata 
                //specify result.id otherwise we will get an error (TODO - maybe dont need this?)
                return {...result._doc, 
                    //_id: result.id
                };  
            })
            .catch(err => {
                console.log(err); 
                throw err; 
            })
        },
        //UPDATES A CATEGORY - WORKING
        updateCategory: (parent, args) => {
            const filter = {_id: args.id}; 
            
            //update category 
            //new true returns back the newly updated doc instead of the old one 
            return db.Category.findOneAndUpdate(filter,args.categoryInput, {new: true})
            .then(updatedCategory=>{
                return {...updatedCategory._doc}; 
            }).catch(err => {
                console.log(err); 
                throw err; 
            })
        }
    }
}


module.exports = categoryResolver; 