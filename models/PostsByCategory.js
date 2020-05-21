const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostsByCategorySchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    posts: Number 
}) 

const PostsByCategory = mongoose.model("PostsByCategory", PostsByCategorySchema);

module.exports = PostsByCategory;