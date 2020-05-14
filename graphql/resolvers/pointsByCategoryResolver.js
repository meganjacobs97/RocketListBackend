const db = require("../../models"); 


const pointsByCategoryResolver = {
    //takes in user id, category id, and initializes with one point - WORKING 
    createPointsByCategory: args => {
        createPointsByCategoryFunc(args.pointsByCategoryInput); 
    },
    //takes in a userId & categoryId. returns the points for that category for that user - WORKING 
    pointsByCategoryByUser: args => {
        return db.PointsByCategory.findOne({
            user: args.userId,
            category: args.categoryId
        })
        .then(pointsByCategory => {
            return {...pointsByCategory._doc}
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })
    },
    //takes in a userId and returns the total number of points for that user across all categories (as an integer)- WORKING
    //WILL NOT NEED THIS IF WE KEEP THE POINTS FIELD IN THE USER AND UPDATE IT SEPARATELY - TODO
    allPointsByUser: args => {
        return db.PointsByCategory.find({
            user: args.userId
        }).then(pointsObjs => {
            let sumPoints = 0; 
            for(let i = 0; i < pointsObjs.length; i++) {
                sumPoints += pointsObjs[i].points; 
            }
            return sumPoints; 
        }).catch(err => {
            console.log(err); 
            throw err; 
        })

    },
    //takes in a category id and return an array of pointsbycategory objects sorted in descending order by points - WORKING
    //THIS IS HOW YOU SORT TOP USERS (POINTS-WISE) BY CATEGORY
    pointsByCategory: args => {
        return db.PointsByCategory.find({
            category: args.categoryId
        }).then(pointsObjs => {
            return sortArray(pointsObjs); 
        }).then(sortedArray => {
            return sortedArray; 
        }).catch(err => {
            console.log(err); 
            throw err; 
        })
    },
    //takes in a user id and category id and adds the passed number of points to the current number of points; returns the updated pointsbycategory - WORKING
    //NOTE: THIS ALSO UPDATES THE POINTS FIELD FOR THE USER 
    updatePointsByCategory: args => {
        const filter = {
            user: args.userId,
            category: args.categoryId
        }
        let userPoints; 
        let pointsByCategoryResult; 
        //first query to get current points 
        return db.PointsByCategory.findOne(filter)
        .then(pointsByCategory => {
            //if null, need to create 
            if(!pointsByCategory) {
               return createPointsByCategoryFunc({userId: args.userId, categoryId:args.categoryId})
               .then(returnval => {
                console.log(returnval); 
                userPoints = returnval.user.points + args.pointsByCategoryInput.points
                return db.PointsByCategory.findOneAndUpdate(filter,{points: userPoints}, {new: true})
                })
                .then(updatedPointsByCategory => {
                    pointsByCategoryResult = updatedPointsByCategory; 
                    return db.User.findByIdAndUpdate(args.userId,{points: userPoints})
                })
                .then(updatedUser => {
                    return pointsByCategoryResult; 
                })
               .catch(err => {
                   console.log(err); 
                   throw err; 
               })
               
            }
            else {
                userPoints = pointsByCategory._doc.points + args.pointsByCategoryInput.points; 
            }
            
            //then update 
            return db.PointsByCategory.findOneAndUpdate(filter,{points: userPoints}, {new: true})
        })
        .then(updatedPointsByCategory => {
            pointsByCategoryResult = updatedPointsByCategory; 
            return db.User.findByIdAndUpdate(args.userId,{points: userPoints})
        })
        .then(updatedUser => {
            return pointsByCategoryResult; 
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

//separated into a function in case we need to call separately
createPointsByCategoryFunc = (args) => {
    const newObj = new db.PointsByCategory({
        user: args.userId, 
        category: args.categoryId,
        points: 1
    })
    let pointsByCategoryResult; 
    //save to database
    return db.PointsByCategory
    .create(newObj).then(result => {
        //return the new user
        //return a null value for the password 
        pointsByCategoryResult = {...result._doc
            //_id: result.id
        }; 
        return db.User.findById(args.userId)
    }).then(user => {
        if(!user) {
            throw new Error("user id does not exist")
        }
        //add to user's array 
        user.pointsByCategory.push(pointsByCategoryResult)
        //update ust 
        return user.save()
    }).then(userResult => {
        return pointsByCategoryResult; 
    })
    .catch(err => {
        console.log(err); 
        throw err; 
    })
}

module.exports = pointsByCategoryResolver; 
