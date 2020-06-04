//import mongoDB models 
const db = require("../../models"); 
const mongoose = require("mongoose")

const replyResolver = {
    Reply: {
        //populate post 
        async post(parent,args,context) {
            const post = await db.Post.findOne({id:mongoose.ObjectId(parent.post)}); 
            if(post.replies) {
                post.replies = post.replies.reverse();
            }
            post.date_created = reduceDate(post.date_created);
            return post; 
        }, 
        //populate author 
        async author(parent, args, context) {
            const retUser = await db.User.findOne({_id: parent.author})
            if(retUser.posts) {
                retUser.posts = retUser.posts.reverse(); 
                for(let i = 0; i < retUser.posts.length; i++) {
                    if(retUser.posts[i].replies) {
                        retUser.posts[i].replies = retUser.posts[i].replies.reverse(); 
                    }
                }
            }
            return retUser; 
        },
        //populate category
        async category(parent, args, context) {
            const category = await db.Category.findOne({id: mongoose.ObjectId(parent.category)})
            return category; 
        }
    },
    RootQuery: {
        //RETURN REPLIES BY POST ID
        replies: (parent,args) => {
            console.log(args); 
            return db.Reply.find({post:args.postId})
            .then(replies => {
                return replies.reverse(); 
            })
            .catch(err => {
                console.log(err); 
                throw err; 
            })
        }
    },
    RootMutation: {
         
        //CREATE A REPLY AND RETURN REPLY 
        createReply: (parent,args) => {
            // if(!req.isAuth) {
            //     throw new Error("unathenticated")
            // }
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
            // let userNumPosts; 
            let userId = args.replyInput.authorId; 
            let categoryId = args.replyInput.categoryId; 
            //store reply to database 
            return db.Reply.create(newReply)
            .then(result => {
                //result refers to the reply that we just created 
                createdReply = {...result._doc };  
                return db.User.findById(args.replyInput.authorId)
            })
            .then(user => {
                //if we get this error then something has gone wrong on dev end  
                if(!user) {
                    throw new Error("user id does not exist"); 
                }
                //add created post to the user 
                user.replies.push(newReply); 

                //update user 
                return user.save(); 
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
        //UPDATES A REPLY AND RETURNS THE POST THE UPDATED REPLY 
        updateReply: (parent,args) => {
            // if(!req.isAuth) {
            //     throw new Error("unathenticated")
            // }
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
                .then(userUpdated => {
                    return updatedReply; 
                })
                .catch(err => {
                    console.log(err); 
                    throw err; 
                })
            }
        }, 
        //DELETES A REPLY AND RETURNS THE UPDATED POST IT BELONGS TO 
        deleteReply: (parent,args) => {
            // if(!req.isAuth) {
            //     throw new Error("unathenticated")
            // }
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
        pointsByCategoryResult = {...result._doc }; 
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
//reduce the date string
reduceDate = (dateCreated) => {
    const spaceIndex = dateCreated.indexOf(" ") + 1; 
    let plusIndex = dateCreated.indexOf('\+'); 
    if(plusIndex === -1) {
        plusIndex = dateCreated.indexOf('\-');
    }
    return dateCreated.substring(spaceIndex,plusIndex); 
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
        postsByCategoryResult = {...result._doc }; 
        return db.User.findById(userId)
    }).then(user => {
        if(!user) {
            throw new Error("user id does not exist")
        }
        //add to user's array 
        user.postsByCategory.push(postsByCategoryResult)
        //update user
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