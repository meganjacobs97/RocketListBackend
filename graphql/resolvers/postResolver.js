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
        .find({}).then(posts => {
            if(!args.postInput.sortRepliesByPoints) {
                return posts; 
            }
            else {
                //sort replies 
                let returnPosts = {...posts}; 
                returnPosts.replies = returnPosts.replies.sortRepliesByPoints(); 
                return returnPosts; 
            }
            
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
            author: args.postInput.authorId,
            category: args.postInput.categoryId
        })
        //to store the post that we are creating so that we can return it at the end 
        let createdPost; 
        let numUserPosts; 
        let filter; 
        //store post to database 
        return db.Post
        .create(newPost).then(result => {
            //result refers to the post that we just created 
        
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
            console.log(user.numPosts);
            console.log(numUserPosts); 
            //update user
            return user.save(); 

        })
        .then(userResult => {
            //result now refers to the updated user
            //still need to update numPosts 
            return db.User.findByIdAndUpdate(args.postInput.authorId,{numPosts: numUserPosts},{new:true})
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
            //need to update the postsByCategory
            filter = {
                user: args.postInput.authorId,
                category: args.postInput.categoryId
            }
            //first query to get current posts
            return db.PostsByCategory.findOne(filter)
        })
        .then(postsByCategory => {
            //if null, need to create 
            if(!postsByCategory) {
               return createPostsByCategoryFunction({userId: args.postInput.authorId, categoryId:args.postInput.categoryId, posts:1})
            }
            //otherwise we can update
            else {
                return db.PostsByCategory.findOneAndUpdate(filter,{posts: numUserPosts}, {new: true})
            }
        })
        .then(updatedPostByCategory => {
            
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

//for creating a postbycategory document 
createPostsByCategoryFunction = (args) => {
    const newObj = new db.PostsByCategory({
        user: args.userId, 
        category: args.categoryId,
        posts: args.posts
    })
    let postsByCategoryResult; 
    //save to database
    return db.PostsByCategory
    .create(newObj).then(result => {
        //return the new user
        //return a null value for the password 
        postsByCategoryResult = {...result._doc
            //_id: result.id
        }; 
        return db.User.findById(args.userId)
    }).then(user => {
        if(!user) {
            throw new Error("user id does not exist")
        }
        //add to user's array 
        user.postsByCategory.push(postsByCategoryResult)
        //update ust 
        return user.save()
    }).then(userResult => {
        return postsByCategoryResult; 
    })
    .catch(err => {
        console.log(err); 
        throw err; 
    })
}

sortRepliesByPoints = (unsorted) => {
    let sortedResults = unsorted; 
    sortedResults.sort(function(a, b){
        if(a.points > b.points) { 
            return -1; 
        }
        else if(a.points < b.points) {
            return 1; 
        }
        return 0;
    })
    //return sorted
    return sortedResults; 
}

module.exports = postResolver; 