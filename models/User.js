const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const autopopulate = require("mongoose-autopopulate"); 

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  points: Number,
  //keeps track of total number of posts and replies 
  numPosts: Number,
  //is mod or not 
  isMod: Boolean,
  pointsByCategory: [
    {
      type: Schema.Types.ObjectId,
      ref: "PointsByCategory",
      autopopulate: false
    }
  ],
  postsByCategory: [
    {
      type: Schema.Types.ObjectId,
      ref: "PostsByCategory",
      autopopulate: false
    }
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
      autopopulate: true
    }
  ],
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Reply",
      autopopulate: true
    }
  ]
});

UserSchema.plugin(autopopulate); 

const User = mongoose.model("User", UserSchema);

module.exports = User;
