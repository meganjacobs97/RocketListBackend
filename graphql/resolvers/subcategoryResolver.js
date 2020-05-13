//import mongoDB models 
const db = require("../../models"); 

const subcategoryResolver = {
    //GET A CATEGORY 
    subcategory: args => {
        return db.Subcategory.findOne({_id:args.id}).then(subcategory=> {
            return {...subcategory._doc}; 
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })
    },
    //GET ALL CATEGORIES 
    subcategories: args => {
        //return here so graphql knows we are doing something async and wont return until done 
        return db.Subcategory
        //TODO: specify args in the {} for the data we want back
        .find({}).then(subcategories => {
            //map so that we're not returning all the metadata
            //have to convert the id to a string otherwise we will get an error (TODO: maybe we dont need to do this)
            return subcategories.map(subcategory => {
                return {...subcategory._doc, 
                    //_id: post.id
                    //date_created: new Data(post._doc.date_created).toISOString(); 
                }
            })
        }).catch(err => {
            console.log(err); 
            throw err; 
        })
    }, 
    //CREATE SUBCATEGORY AND RETURN IT - WORKING
    createSubcategory: args => {
        //create 
        console.log(args)
        const newSubcategory = new db.Subcategory({
            name: args.subcategoryInput.name,
            description: args.subcategoryInput.description,
            category: args.subcategoryInput.categoryId
        })
        let createdSubcategory;
        //store category to database 
        return db.Subcategory.create(newSubcategory).then(result => {
            //result refers to the post that we just created 
            console.log(result);
            //...result._doc returns result without all the associated metadata 
            //specify result.id otherwise we will get an error (TODO - maybe dont need this?)
            createdSubcategory = {...result._doc, 
                //_id: result.id
            };  

            return db.Category.findById(args.subcategoryInput.categoryId)
        }).then(category => {
            if(!category) {
                throw new Error("cateogry id does not exist")
            }
            //add created subcategory 
            category.subcategories.push(createdSubcategory); 
            //update category 
            return category.save(); 
        })
        .then(categoryResult => {
            //result is now the updated category 
            return createdSubcategory;
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })
    },
    //UPDATE SUBCATEGORY 
    updateSubcategory: args => {
        const filter = {_id: args.id}; 
        
        //update category 
        //new true returns back the newly updated doc instead of the old one 
        return db.Subcategory.findOneAndUpdate(filter,args.subcategoryInput, {new: true})
        .then(updatedSubcategory=>{
            return {...updatedSubcategory._doc}; 
        }).catch(err => {
            console.log(err); 
            throw err; 
        })
    }
}

module.exports = subcategoryResolver; 