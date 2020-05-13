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



module.exports = userResolver; 