const express = require("express");
//const cors = require("cors"); 
const { ApolloServer } = require ('apollo-server-express');
// const path = require('path');
require("dotenv").config(); 

const app = express();

const mongoose = require("mongoose");

const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}


// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI)
.then().catch(err => console.log(err));


//import api schema
const graphqlResolvers = require("./graphql/resolvers");
const graphqlSchema = require("./graphql/schema");

const server = new ApolloServer({
  typeDefs: graphqlSchema,
  resolvers: graphqlResolvers,
  graphiql: true,
  cors: true,
  formatError(e) {
      console.error(e);
      console.log(JSON.stringify(e, null, '\t'));
      return e;
  }
});

server.applyMiddleware({ app });


// Start the API server
const expressServer = app.listen(PORT, function() {
    console.log(`🚀 ==> API Server now listening on PORT ${server.graphqlPath}/${PORT}!`);
});