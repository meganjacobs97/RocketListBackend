//import mongoDB models 
const db = require("../../models"); 

const postResolver = {
    //GETS A POST - WORKING 
    post: (args) => {
        return db.Post.findOne({_id:args.id}).then(post=> {
            return {...post._doc}; 
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })

    },
    //GETS ALL POSTS - WORKING 
    posts: (args) => {
        //return here so graphql knows we are doing something async and wont return until done 
        return db.Post
        //TODO: specify args in the {} for the data we want back
        .find({}).then(posts => {
            //map so that we're not returning all the metadata
            //have to convert the id to a string otherwise we will get an error (TODO: maybe we dont need to do this)
            return posts.map(post => {
                return {...post._doc, 
                    //_id: post.id
                    //date_created: new Data(post._doc.date_created).toISOString(); 
                }
            })
        }).catch(err => {
            console.log(err); 
            throw err; 
        })
    },
    //CREATE A POST - WORKING 
    //createPost accepts a list of arguments - argument lists can be added to any query, not just mutations
    createPost: (args) => {
        //create 
        const newPost = new db.Post({
            title: args.postInput.title,
            body: args.postInput.body || "",
            //post will always be unlocked upon creation
            is_locked: false,
            //date_created: new Date(Date.now()),
            //date_created: new Data(args.postInput.date).toISOString(); 
            points: 0,
            subcategory: args.postInput.subcategoryId,
            author: args.postInput.authorId
        })
        //to store the post that we are creating so that we can return it at the end 
        let createdPost; 
        let numUserPosts; 
        //store post to database 
        return db.Post
        .create(newPost).then(result => {
            //result refers to the post that we just created 
            console.log(result);
            //...result._doc returns result without all the associated metadata 
            //specify result.id otherwise we will get an error (TODO - maybe dont need this?)
            createdPost = {...result._doc, 
                //_id: result.id
            };  
            return db.User.findById(args.postInput.authorId)
        })
        .then(user => {
            //if we get this error then something has gone wrong on dev end  
            if(!user) {
                throw new Error("user id does not exist"); 
            }
            //add created post to the user 
            user.posts.push(newPost); 
            //grab current numposts and increment 
            numUserPosts = user.numPosts + 1; 
            //update user
            return user.save(); 

        })
        .then(userResult => {
            //result now refers to the updated user
            //still need to update numPosts 
            db.User.findByIdAndUpdate(args.postInput.authorId,{numPosts: numUserPosts})
        })
        .then(userUpdateResult => {
            //update the subcategory 
            return db.Subcategory.findById(args.postInput.subcategoryId)
        })
        .then(subcategory => {
            //if we get this error then something has gone wrong on dev end  
            if(!subcategory) {
                throw new Error("subcategory id does not exist"); 
            }
            //add created post to the user 
            subcategory.posts.push(createdPost); 
            //update user 
            return subcategory.save(); 

        })
        .then(categoryResult => {
            //result now refers to the updated category 
            console.log(createdPost);
            //instead we have to return the createdpost
            return createdPost; 
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })
    },
    //UPDATE A POST - WORKING 
    updatePost: args => {
        const filter = {_id: args.id}; 
        
        
        //update post 
        //new true returns back the newly updated doc instead of the old one 
        return db.Post.findOneAndUpdate(filter,args.postInput, {new: true})
        .then(updatedPost=>{
            return {...updatedPost._doc,password: null}; 
        }).catch(err => {
            console.log(err); 
            throw err; 
        })
        
    }
}



module.exports = postResolver; 