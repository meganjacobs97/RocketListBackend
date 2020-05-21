const mongoose = require("mongoose");

const Schema = mongoose.Schema;

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
  isMod: Boolean,
  pointsByCategory: [
    {
      type: Schema.Types.ObjectId,
      ref: "PointsByCategory",
    }
  ],
  postsByCategory: [
    {
      type: Schema.Types.ObjectId,
      ref: "PostsByCategory",
    }
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    }
  ],
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Reply",
    }
  ]
});


const User = mongoose.model("User", UserSchema);

module.exports = User;
