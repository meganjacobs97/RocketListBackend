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
