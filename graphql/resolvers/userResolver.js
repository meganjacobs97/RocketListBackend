//for password encryption 
const bcrypt = require("bcrypt"); 

//import mongoDB models 
const db = require("../../models"); 

const userResolver = {
    //GETS A USER - WORKING 
    user: args => {
        return db.User.findOne({_id:args.id}).then(user=> {
            
            return {...user._doc}; 
            
        })
        .catch(err => {
            console.log(err); 
            throw err; 
        })
        
    }, 
    //GETS ALL USERS - WORKING
    //takes in optional booleans to sort all users by points and to sort all users by number of posts and replies 
    users: args => {
        //return here so graphql knows we are doing something async and wont return until done 
        return db.User
        //TODO: specify args in the {} for the data we want back
        .find({}).then(users => {
            //map so that we're not returning all the metadata
            //overwrite password to be null so we're not returning it 
            return users.map(user => {
                return {...user._doc, 
                    password: null
                }
            })
        }).then(usersUnsorted => {
            if(args.sortByPosts) {
                return(sortByPosts(usersUnsorted)); 
            } 
            else if(args.sortByPoints) {
                return(sortByPoints(usersUnsorted)); 
            }
            else {
                return usersUnsorted; 
            }
        }).catch(err => {
            console.log(err); 
            throw err; 
        })

    },
    //CREATES A USER - WORKING
    createUser: args => {
        //see if user with that email address already exists - TODO; change later?? not sure if we need this validation here or if we can just handle it with the database model 
        return db.User.findOne({email: args.userInput.email}).then(user => {
            if(user) {
                throw new Error("email taken"); 
            }
        
            const newUser = new db.User({
                username: args.userInput.username, 
                //encrypt password
                password: bcrypt.hashSync(args.userInput.password,bcrypt.genSaltSync(12),null),
                email: args.userInput.email,
                points: 0
            })
            return db.User
            //save to database
            .create(newUser).then(result => {
                console.log(result);
                //return the new user
                //return a null value for the password 
                return {...result._doc, password: null, 
                    //_id: result.id
                }; 

            })
        })
        .then().catch(err => {
            console.log(err);
            throw err; 
        })
    },
    //UPDATES A USER - WORKING 
    updateUser: args => {  
        const filter = {_id: args.id}; 
        //update user 
        //new true returns back the newly updated doc instead of the old one 
        return db.User.findOneAndUpdate(filter,args.userInput, {new: true})
        .then(updatedUser=>{
            return {...updatedUser._doc,password: null}; 
        }).catch(err => {
            console.log(err); 
            throw err; 
        })
    }
}
//helper by functions 
sortByPosts = (unsorted) => {
    let sortedResults = unsorted; 
    sortedResults.sort(function(a, b){
        if(a.numPosts > b.numPosts) { 
            return -1; 
        }
        else if(a.numPosts < b.numPosts) {
            return 1; 
        }
        return 0;
    })
    //return sorted
    return sortedResults; 


}
sortByPoints = (unsorted) => {
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


module.exports = userResolver; 