const express = require("express");
//const cors = require("cors"); 
const { ApolloServer } = require ('apollo-server-express');
const isAuth = require("./middleware/is-auth")
// const path = require('path');
require("dotenv").config(); 

const app = express();

// const router = express.Router();
// router.get("/",(req,res)=> {
//   res.sendFile(path.join(__dirname+'/main.html'));  
// })
// app.use("/",router); 

const mongoose = require("mongoose");

//allows us to connect the API schema and resolvers 
//const expressGraphql = require("express-graphql"); 


const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}


//allow cross-server requests - TODO: specify deployed sites 

//app.use(cors()); 

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI)
.then().catch(err => console.log(err));

// app.use(isAuth); ////

//import api schema
const graphqlResolvers = require("./graphql/resolvers");
const graphqlSchema = require("./graphql/schema");

const server = new ApolloServer({
  typeDefs: graphqlSchema,
  resolvers: graphqlResolvers,
  graphiql: true,
  cors: true,
  // context({req,res}) {
  //   // req: express.Request,
  //   // res: express.Response
  //     // console.log('create context');
  //     // // Get the user token from the headers.
  //     // const token = req.headers.authorization || '';

  //     // // try to retrieve a user with the token
  //     // const user = getUser(token);

  //     // // add the user to the context
  //     // return { user };
  // },
  formatError(e) {
      console.error(e);
      console.log(JSON.stringify(e, null, '\t'));
      return e;
  }
});

//graphql has only one endpoint
// app.use('/api', expressGraphql({
    
//     schema: graphqlSchema,
//     rootValue: graphqlResolvers,
//     //gives us a built-in way to test our API by hitting the specified route (/api) on the server
//     //TODO: delete before deployment 
//     graphiql: true
// }))

server.applyMiddleware({ app });


// Start the API server
const expressServer = app.listen(PORT, function() {
    console.log(`🚀 ==> API Server now listening on PORT ${server.graphqlPath}/${PORT}!`);
});

