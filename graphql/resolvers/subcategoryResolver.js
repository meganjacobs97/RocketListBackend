//import mongoDB models 
const db = require("../../models"); 
const mongoose = require("mongoose"); 

const subcategoryResolver = {
    Subcategory: {
        //populate posts 
        async posts(parent, args, context) {
            const posts = await db.Post.find({subcategory: parent._id})
            for(let i = 0; i < posts.length; i++) {
                posts[i].date_created = reduceDate(posts[i].date_created); 
            }
            return posts.reverse(); 
        },
        //populate category 
        async category(parent, args, context) {
            console.log(parent)
            const category = await db.Category.findOne({_id: parent.category})
            return category; 
        }
    }, 
    RootQuery: {
        //GET A CATEGORY 
        subcategory: (parent,args) => {
            return db.Subcategory.findOne({_id:args.id}).then(subcategory=> {
                if(subcategory) {
                    return {...subcategory._doc}; 
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
        //GET ALL CATEGORIES 
        subcategories: (parent,args) => {
            //return here so graphql knows we are doing something async and wont return until done 
            return db.Subcategory.find({})
            .then(subcategories => {
                if(subcategories) {
                    //map so that we're not returning all the metadata
                    return subcategories.map(subcategory => {
                        return {...subcategory._doc}
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
        //CREATE SUBCATEGORY AND RETURN IT 
        createSubcategory: (parent,args) => {
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
                //result refers to the cat that we just created 
                createdSubcategory = {...result._doc};  

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
        updateSubcategory: (parent,args) => {
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
}
//reduce the date string
reduceDate = (dateCreated) => {
    const spaceIndex = dateCreated.indexOf(" ") + 1; 
    let plusIndex = dateCreated.indexOf('\+'); 
    if(plusIndex === -1) {
        plusIndex = dateCreated.indexOf('\-');
    }
    return dateCreated.substring(spaceIndex,plusIndex); 
}

module.exports = subcategoryResolver; 