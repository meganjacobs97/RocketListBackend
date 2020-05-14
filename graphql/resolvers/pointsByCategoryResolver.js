const db = require("../../models"); 


const pointsByCategoryResolver = {
    //takes in user id, category id, and initializes with one point - WORKING 
    createPointsByCategory: args => {
        const newObj = new db.PointsByCategory({
            user: args.pointsByCategoryInput.userId, 
            category: args.pointsByCategoryInput.categoryId,
            points: 1
        })
        let pointsByCategoryResult; 
        //save to database
        return db.PointsByCategory
        .create(newObj).then(result => {
            console.log(result);
            //return the new user
            //return a null value for the password 
            pointsByCategoryResult = {...result._doc
                //_id: result.id
            }; 
            return db.User.findById(args.pointsByCategoryInput.userId)
        }).then(user => {
            if(!user) {
                throw new Error("user id does not exist")
            }
            //add to user's array 
            user.pointsByCategory.push(pointsByCategoryResult)
            //update ust 
            return user.save()
        }).then(userResult => {
            console.log(pointsByCategoryResult); 
            return pointsByCategoryResult; 
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })

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
    //NOTE: THIS DOES NOT UPDATE THE "POINTS" FIELD FOR THE USER; MUST DO A SEPARATE CALL FOR THAT 
    updatePointsByCategory: args => {
        const filter = {
            user: args.userId,
            category: args.categoryId
        }
        let userPoints; 
        //first query to get current points 
        return db.PointsByCategory.findOne(filter)
        .then(pointsByCategory => {
            userPoints = pointsByCategory._doc.points + args.pointsByCategoryInput.points; 
            //then update 
            return db.PointsByCategory.findOneAndUpdate(filter,{points: userPoints}, {new: true})
        })
        .then(updatedPointsByCategory => {
            return updatedPointsByCategory; 
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
    console.log(sortedResults)
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

module.exports = pointsByCategoryResolver; 
