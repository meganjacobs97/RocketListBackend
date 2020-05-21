//import mongoDB models 
const db = require("../../models"); 

const categoryResolver = {
    Category: {
        //populate subcategories 
        async subcategories(parent, args, context) {
           const subcategoriesByCategory = await db.Subcategory.find({category: parent._id}); 
           
           return subcategoriesByCategory; 
        }
    },
    RootQuery: {
        //GETS A SINGLE CATEGORY 
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
        //GETS ALL CATEGORIES
        categories: (parent, args) => {
            //return here so graphql knows we are doing something async and wont return until done 
            return db.Category.find({}).then(categories => {
                if(categories) {
                    //map so that we're not returning all the metadata
                    return categories.map(category => {
                        return {...category._doc}
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
        //CREATES A CATEGORY 
        //this query probably wont be hit outside of development 
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

                return {...result._doc };  
            })
            .catch(err => {
                console.log(err); 
                throw err; 
            })
        },
        //UPDATES A CATEGORY 
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