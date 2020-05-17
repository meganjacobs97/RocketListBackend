//import mongoDB models 
const db = require("../../models"); 

const replyResolver = {
    //CREATE A REPLY AND RETURN REPLY - WORKING 
    createReply: args => {
        //create 
        const newReply = new db.Reply({
            body: args.replyInput.body, 
            post: args.replyInput.postId, 
            author: args.replyInput.authorId,
            category: args.replyInput.categoryId,
            points: 0
        })
        //to store the post that we are creating so that we can return it at the end 
        let createdReply; 
        let userNumPosts; 
        let userId = args.replyInput.authorId; 
        let categoryId = args.replyInput.categoryId; 
        //store reply to database 
        return db.Reply
        .create(newReply).then(result => {
            //result refers to the reply that we just created 
            //...result._doc returns result without all the associated metadata 
            //specify result.id otherwise we will get an error (TODO - maybe dont need this?)
            createdReply = {...result._doc, 
                //_id: result.id
            };  
            return db.User.findById(args.replyInput.authorId)
        })
        .then(user => {
            //if we get this error then something has gone wrong on dev end  
            if(!user) {
                throw new Error("user id does not exist"); 
            }
            //add created post to the user 
            user.replies.push(newReply); 
            //grab current number of posts and increment
            userNumPosts = user.numPosts + 1; 
            console.log(user.numPosts); 
            console.log(userNumPosts)
            //update user 
            return user.save(); 

        })
        //result now refers to the updated user
        .then(userResult => {
            //still have to update numPosts 
            return db.User.findByIdAndUpdate(args.replyInput.authorId,{numPosts: userNumPosts},{new:true})
        })
        .then(updatedUser => {
            //update posts by category 
            return db.PostsByCategory.findOne({user:userId,category:categoryId})
        })
        .then(postsByCategory => {
            //if we need to create 
            if(!postsByCategory) {
                return createPostsByCategoryFunction({user:userId,category:categoryId})
            }
            else {
                console.log(postsByCategory.posts);
                let newPosts = postsByCategory.posts + 1; 
                return db.PostsByCategory.findOneAndUpdate({user:userId,category:categoryId},{posts:newPosts})
            }
        }).then(res => {
            //update post 
            return db.Post.findById(args.replyInput.postId)
        })
        .then(post => {
            //if we get this error then something has gone wrong on dev end  
            if(!post) {
                throw new Error("post id does not exist"); 
            }
            //add created reply to the post
            post.replies.push(createdReply); 
            //update user 
            return post.save(); 
        })
        .then(postResult => {
            //result now refers to the updated post data (not the post itself) 
            //need to return created reply 
            return createdReply; 
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })
    }, 
    //UPDATES A REPLY AND RETURNS THE POST THE UPDATED REPLY - WORKING 
    updateReply: args => {
        if(args.replyInput !== null && args.replyInput.points === null ) {
            const filter = {_id: args.id};     
        
            //update reply 
            //new true returns back the newly updated doc instead of the old one 
            return db.Reply.findOneAndUpdate(filter,args.replyInput, {new: true})
            .then(updatedReply=>{
                return {...updatedReply._doc}; 
            }).catch(err => {
                console.log(err); 
                throw err; 
            })
        }
        else {      
            let filter = {_id: args.id}; 
            let updatedReply; 
            let userPoints; 
            let userId; 
            let pointsAdded; 
            //update reply 
            //first have to get old points 
            return db.Reply.findById(args.id)
            .then(oldReply => {
                let newPoints 
                if(args.replyInput) {
                    pointsAdded = args.replyInput.points; 
                }
                else {
                    pointsAdded = 1;    
                }
                newPoints = oldReply.points + pointsAdded;
                //new true returns back the newly updated doc instead of the old one 
                return db.Reply.findOneAndUpdate(filter,{points:newPoints}, {new: true})
            }).then(reply => {
                updatedReply = {...reply._doc}; 
                userPoints = updatedReply.author.points + pointsAdded; 
                userId = updatedReply.author._id; 
                console.log(userId); 
                
                //need to update the pointsByCategory
                filter = {
                    user: updatedReply.author._id,
                    category: updatedReply.category._id
                }
                //first query to get current points
                return db.PointsByCategory.findOne(filter)
                .then(pointsByCategory => {
                    
                    //if null, need to create 
                    if(!pointsByCategory) {
                        filter.points = pointsAdded; 
                        return createPointsByCategoryFunction(filter)
                    }
                    //otherwise we can update
                    else {
                        newPoints = pointsByCategory.points += pointsAdded; 
                        return db.PointsByCategory.findOneAndUpdate(filter,{points: newPoints}, {new: true})
                    }
                })
            
            })
            .then(result => {
                //now update the user 
                return db.User.findByIdAndUpdate(userId,{points:userPoints})
            })
            .then(userUpdated => {
                return updatedReply; 
            })
            .catch(err => {
                console.log(err); 
                throw err; 
            })
        }
    }, 
    //DELETES A REPLY AND RETURNS THE UPDATED POST IT BELONGS TO - WORKING 
    deleteReply: args => {
        //grab the id of the post so we can pass it back 
        let postId; 
        return db.Reply.findOne({_id:args.id}
        ).then(reply => {
            
            postId = reply._doc.post._id; 
            //delete the reply 
            return db.Reply.deleteOne({_id:args.id})
        }).then(deletedData => {
            //find the post to return 
            return db.Post.findOne({_id:postId})
        }).then(post => {
            //return the post 
            return {...post._doc}; 
        }) .catch(err => {
            console.log(err); 
            throw err; 
        })
    }

}

createPointsByCategoryFunction = (args) => {
    const newObj = new db.PointsByCategory({
        user: args.user, 
        category: args.category,
        points: args.points
    })
    let pointsByCategoryResult; 
    //save to database
    return db.PointsByCategory
    .create(newObj).then(result => {
        pointsByCategoryResult = {...result._doc
            //_id: result.id
        }; 
        console.log(args.user); 
        return db.User.findById(args.user)
    }).then(user => {
        console.log(user); 
        if(!user) {
            throw new Error("user id does not exist")
        }
        //add to user's array 
        user.pointsByCategory.push(pointsByCategoryResult)
        //update user
        return user.save()
    }).then(userResult => {
        return pointsByCategoryResult; 
    })
    .catch(err => {
        console.log(err); 
        throw err; 
    })

}

createPostsByCategoryFunction = (args) => {
    let userId = args.user; 
    const newObj = new db.PostsByCategory({
        user: args.user, 
        category: args.category,
        posts: 1
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
        return db.User.findById(userId)
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


module.exports = replyResolver; 