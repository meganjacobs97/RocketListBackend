const db = require("../../models"); 

const postsByCategoryResolver = {
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