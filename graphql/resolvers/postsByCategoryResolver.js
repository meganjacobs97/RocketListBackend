const db = require("../../models"); 

// postsByCategoryByUser(userId: ID!,categoryIdL ID!): PostsByCategory
// postsByCategory(categoryId: ID!): [PostsByCategory]
//updatePostsByCategory(userId: ID!, categoryId: ID!,postsByCategoryInput: postsByCategoryInput): PostsByCategory
//createPostsByCategory(postsByCategoryInput: postsByCategoryInput): PostsByCategory

const postsByCategoryResolver = {
    //takes in user id, category id, and initializes with one post 
    createPostsByCategory: args => {
        createPostsByCategoryFunc(args.postsByCategoryInput); 
    },
    //takes in a userId & categoryId. returns the posts for that category for that user 
    postsByCategoryByUser: args => {
        return db.PostsByCategory.findOne({
            user: args.userId,
            category: args.categoryId
        })
        .then(postsByCategory => {
            return {...postsByCategory._doc}
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })
    },
    //takes in a category id and return an array of postsbycategory objects sorted in descending order by posts 
    //THIS IS HOW YOU SORT TOP USERS (POSTS-WISE) BY CATEGORY
    postsByCategory: args => {
        return db.PostsByCategory.find({
            category: args.categoryId
        }).then(postsObjs => {
            return sortArray(postsObjs); 
        }).then(sortedArray => {
            return sortedArray; 
        }).catch(err => {
            console.log(err); 
            throw err; 
        })
    },
     //takes in a user id and category id and adds the passed number of posts to the current number of posts; returns the updated pointsbycategory - WORKING
    //NOTE: THIS ALSO UPDATES THE POSTS FIELD FOR THE USER 
    updatePostsByCategory: args => {
        const filter = {
            user: args.userId,
            category: args.categoryId
        }
        let userPosts; 
        let postsByCategoryResult; 
        let post = args.postsByCategoryInput.posts; 
        if(!post) {
            post = 1; 
        }
        //first query to get current posts
        return db.PostsByCategory.findOne(filter)
        .then(postsByCategory => {
            //if null, need to create 
            if(!postsByCategory) {
               return createPostsByCategoryFunc({userId: args.userId, categoryId:args.categoryId, posts:post})
               .then(returnval => {
                console.log(returnval); 
                userPosts = returnval.user.posts + post
                return db.PostsByCategory.findOneAndUpdate(filter,{posts: userPosts}, {new: true})
                })
                .then(updatedPostsByCategory => {
                    postsByCategoryResult = updatedPostsByCategory; 
                    return db.User.findByIdAndUpdate(args.userId,{posts: userPosts})
                })
                .then(updatedUser => {
                    return postsByCategoryResult; 
                })
               .catch(err => {
                   console.log(err); 
                   throw err; 
               })
               
            }
            else {
                userPosts = postsByCategory._doc.posts + post; 
            }
            
            //then update 
            return db.PostsByCategory.findOneAndUpdate(filter,{posts: userPosts}, {new: true})
        })
        .then(updatedPostsByCategory => {
            postsByCategoryResult = updatedPostsByCategory; 
            return db.User.findByIdAndUpdate(args.userId,{posts: userPosts})
        })
        .then(updatedUser => {
            return postsByCategoryResult; 
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })
    }
}

//helper functions 
sortArray = (unsortedArray) => {
    let sortedResults = unsortedArray; 
    sortedResults.sort(function(a, b){
        if(a.posts > b.posts) { 
            return -1; 
        }
        else if(a.posts < b.posts) {
            return 1; 
        }
        return 0;
    })
    //return sorted
    return sortedResults; 
}

//separated into a function in case we need to call separately
createPostsByCategoryFunc = (args) => {
    let post = args.posts; 
    if(!post) {
        post = 1; 
    }
    const newObj = new db.PostsByCategory({
        user: args.userId, 
        category: args.categoryId,
        posts: 0
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

module.exports = postsByCategoryResolver; 