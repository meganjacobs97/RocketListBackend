//import mongoDB models 
const db = require("../../models"); 

const categoryResolver = {
    Category: {
        //populate subcategories 
        async subcategories(parent, args, context) {
            const subcategoriesByCategory = await db.Subcategory.find({category: parent._id}); 

            for(let i = 0; i < subcategoriesByCategory.length; i++) {
                if(subcategoriesByCategory[i].posts) {
                    subcategoriesByCategory[i].posts = subcategoriesByCategory[i].posts.reverse(); 
                    for(let j = 0; j < subcategoriesByCategory[i].posts.length; j++) {
                        if(subcategoriesByCategory[i].posts[j].replies) {
                            subcategoriesByCategory[i].posts[j].replies = subcategoriesByCategory[i].posts[j].replies.reverse(); 
                        }
                    }
                }
            }
            
        
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
        async categories(parent, args) {
            //return here so graphql knows we are doing something async and wont return until done 
            let categories = await db.Category.find({})
            
            if(categories) {
                //map so that we're not returning all the metadata
                cats = categories.map(category => {
                    return {...category._doc}
                })
            }
            else {
                return null; 
            }   
            
            if(args.categoryInput && args.categoryInput.sortByPosts) {
                let catsSorted = [...cats]; 
                
                //for each category need to add up the total number of posts 
                for(let i = 0; i < catsSorted.length; i++) {
                    let posts = 0; 
                    for(let j = 0; j < catsSorted[i].subcategories.length; j++) {
                        //find the subcat by id and grab the posts 
                        posts += await subcatposts(catsSorted[i].subcategories[j]);
                    }
                    
                    catsSorted[i].posts = posts; 
                }
                
                catsSorted.sort(function(a, b){
                    if(a.posts > b.posts) { 
                        return -1; 
                    }
                    else if(a.posts < b.posts) {
                        return 1; 
                    }
                    return 0;
                })
                return catsSorted; 
            }
            else {
                return cats; 
            }   
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

subcatposts = (id) => {
    return db.Post.find({subcategory:id})
    .then(posts => {
        return posts.length; 
    })
    .catch(err => {
        console.log(err); 
        return err; 
    })
}

module.exports = categoryResolver; 