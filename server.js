const express = require("express");

const mongoose = require("mongoose");

//allows us to connect the API schema and resolvers 
const expressGraphql = require("express-graphql"); 

const app = express();
const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

//allow cross-server requests 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/rocketlist");


//import api schema
const graphqlResolvers = require("./graphql/resolvers");
const graphqlSchema = require("./graphql/schema");

//graphql has only one endpoint
app.use('/api', expressGraphql({
    
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    //gives us a built-in way to test our API by hitting the specified route (/api) on the server
    //TODO: delete before deployment 
    graphiql: true
}))

// Start the API server
app.listen(PORT, function() {
    console.log(`🚀 ==> API Server now listening on PORT ${PORT}!`);
});
  