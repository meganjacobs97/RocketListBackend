//for password encryption 
const bcrypt = require("bcrypt");
//for user authentication 
const jsonwebtoken = require('jsonwebtoken');

//import { JWT_SECRET } from '../../../config';
//import mongoDB models 
const db = require("../../models");

const userResolver = {
    User: {
        //populates posts 
        async posts(parent, args, context) {
            const userPosts = await db.Post.find({ author: parent._id });
            for (let i = 0; i < userPosts.length; i++) {
                userPosts[i].date_created = reduceDate(userPosts[i].date_created);
            }
            return userPosts.reverse();
        },
        //calculates number of posts 
        async points(parent, args, context) {
            const userPoints = (
                await db.PointsByCategory.find({ user: parent._id })
            ).reduce(
                (accumulator, categoryPoints) =>
                    accumulator + categoryPoints.points,
                0
            );

            return userPoints;
        },
        //calculates number of posts 
        async numPosts(parent, args, context) {
            const userPosts = (
                await db.PostsByCategory.find({ user: parent._id })
            ).reduce(
                (accumulator, categoryPosts) =>
                    accumulator + categoryPosts.posts,
                0
            )
            return userPosts;
        },
        //populates points by category 
        async pointsByCategory(parent, args, context) {
            const pointsByCategory = await db.PointsByCategory.find({ user: parent._id })

            return pointsByCategory
        },
        //populates posts by category
        async postsByCategory(parent, args, context) {
            const postsByCategory = await db.PostsByCategory.find({ user: parent._id })

            return postsByCategory;
        },
        //populates replies 
        async replies(parent, args, context) {
            const userReplies = await db.Post.find({ author: parent._id });

            return userReplies.reverse();
        }
    },
    RootQuery: {
        //get current user information; takes in token and userid and returns user 
        currentUser: (parent, args) => {
            return jsonwebtoken.verify(args.token, process.env.JWT_SECRET, function (err, decodedToken) {
                if (err) throw err;
                return db.User.findById(decodedToken.userId)
                    .then(user => {
                        return user;
                    })
            })
                .catch(err => {
                    console.log(err);
                    return err;
                })
        },
        //GETS A USER 
        user: (parent, args) => {
            // if(!req.isAuth) {
            //     throw new Error("unathenticated")
            // }
            return db.User.findOne({ _id: args.id }).then(user => {
                return { ...user._doc };
            })
                .catch(err => {
                    console.log(err);
                    throw err;
                })
        },
        //GETS ALL USERS 
        //takes in optional booleans to sort all users by points and to sort all users by number of posts and replies 
        users: (parent, args) => {
            // if(!req.isAuth) {
            //     throw new Error("unathenticated")
            // }
            let filter;
            if (args.userInput) {
                filter = { isMod: args.userInput.isMod }
            }
            else {
                filter = {}
            }
            //return here so graphql knows we are doing something async and wont return until done 
            return db.User.find(filter)
                .then(users => {
                    //map so that we're not returning all the metadata
                    //overwrite password to be null so we're not returning it 
                    return users.map(user => {
                        return {
                            ...user._doc,
                            password: null
                        }
                    })
                }).then(usersUnsorted => {
                    if (args.sortByPosts) {
                        return (sortByPosts(usersUnsorted));
                    }
                    else if (args.sortByPoints) {
                        return (sortByPoints(usersUnsorted));
                    }
                    else {
                        return usersUnsorted;
                    }
                }).catch(err => {
                    console.log(err);
                    throw err;
                })
        }
    },
    RootMutation: {
        //to delete
        login: (parent, { username, password }) => {
            let userRes;
            return db.User.findOne({ username: username })
                .then(user => {
                    if (!user) {
                        throw new Error("Username does not exist");
                    }
                    userRes = user;
                    return bcrypt.compare(password, userRes.password);

                })
                .then(isEqual => {
                    if (!isEqual) {
                        throw new Error("Password is incorrect");
                    }
                    console.log(userRes)
                    return (userRes)
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                })
        },
        //authentication 
        authenticate: async (
            _,
            { credentials: { username, password } },
            context
        ) => {
            try {
                const user = await checkUserCredentials(username, password);

                if (user) {
                    const jwt = jsonwebtoken.sign(
                        { userId: user.id, username: user.username, darkType: user.darkType },
                        process.env.JWT_SECRET,
                        { expiresIn: '30d' }
                    );

                    return {
                        username: user.username,
                        userId: user.id,
                        darkType: user.darkType,
                        token: jwt
                    };
                } else {
                    return null;
                }
            } catch (err) {
                console.error(err);

                return null;
            }
        },
        //create an account and return the authenticated user 
        createAcc: (parent, args) => {
            //check to see if user exists 
            return db.User.findOne({ username: args.credentials.username })
                .then(user => {
                    if (user) throw new Error("username taken");
                    console.log(args);
                    const newUser = new db.User({
                        username: args.credentials.username,
                        password: bcrypt.hashSync(args.credentials.password, bcrypt.genSaltSync(12), null),
                        email: "",
                        isMod: false,
                        darkType: false
                    })
                    //save to database 
                    return db.User.create(newUser)
                        .then(result => {
                            console.log("user created")

                            //create token
                            const jwt = jsonwebtoken.sign(
                                { userId: result.id, username: result.username, darkType: result.darkType },
                                process.env.JWT_SECRET,
                                { expiresIn: '30d' }
                            )

                            //store username token and id in return value 
                            return ({
                                username: result.username,
                                userId: result.id,
                                darkType: result.darkType,
                                token: jwt
                            })
                        })
                })
                .then().catch(err => {
                    console.log(err);
                    throw err;
                })
        },
        //CREATES A USER
        createUser: (parent, args) => {
            //see if user with that email address already exists 
            return db.User.findOne({ username: args.userInput.username }).then(user => {
                if (user) {
                    throw new Error("username taken");
                }

                const newUser = new db.User({
                    username: args.userInput.username,
                    //encrypt password
                    password: bcrypt.hashSync(args.userInput.password, bcrypt.genSaltSync(12), null),
                    email: args.userInput.email || "",
                    isMod: args.userInput.isMod || false
                })
                //save to database
                return db.User.create(newUser)
                    .then(result => {
                        console.log("user created")
                        //return the new user
                        //return a null value for the password 
                        return { ...result._doc, password: null };
                    })
            })
                .then().catch(err => {
                    console.log(err);
                    throw err;
                })
        },
        //UPDATES A USER 
        updateUser: (parent, args) => {
            // if(!req.isAuth) {
            //     throw new Error("unathenticated")
            // }
            const filter = { _id: args.id };
            //update user 
            //new true returns back the newly updated doc instead of the old one 
            return db.User.findOneAndUpdate(filter, args.userInput, { new: true })
                .then(updatedUser => {
                    return { ...updatedUser._doc, password: null };
                }).catch(err => {
                    console.log(err);
                    throw err;
                })
        }
    }
}
//helper by functions 
sortByPosts = (unsorted) => {
    let sortedResults = unsorted;
    sortedResults.sort(function (a, b) {
        if (a.posts.length > b.posts.length) {
            return -1;
        }
        else if (a.posts.length < b.posts.length) {
            return 1;
        }
        return 0;
    })
    //return sorted
    return sortedResults;
}
sortByPoints = (unsorted) => {
    let sortedResults = unsorted;
    sortedResults.sort(function (a, b) {
        if (a.points > b.points) {
            return -1;
        }
        else if (a.points < b.points) {
            return 1;
        }
        return 0;
    })
    //return sorted
    return sortedResults;
}
//helper function for authentication 
checkUserCredentials = (username, password) => {
    let userRes;
    return db.User.findOne({ username: username })
        .then(user => {
            if (!user) {
                return "";
            }
            userRes = user;
            return bcrypt.compare(password, userRes.password);

        })
        .then(isEqual => {
            if (!isEqual) {
                return "";
            }
            return (userRes)
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
    if (plusIndex === -1) {
        plusIndex = dateCreated.indexOf('\-');
    }
    return dateCreated.substring(spaceIndex, plusIndex);
}

module.exports = userResolver; 