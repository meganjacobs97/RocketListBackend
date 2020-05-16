const db = require("../../models"); 


const pointsByCategoryResolver = {
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


module.exports = pointsByCategoryResolver; 
