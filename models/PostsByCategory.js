const mongoose = require("mongoose");

const autopopulate = require("mongoose-autopopulate"); 

const Schema = mongoose.Schema;

const PostsByCategorySchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        autopopulate: true 
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        autopopulate: true
    },
    posts: Number 
}) 

PostsByCategorySchema.plugin(autopopulate); 

const PostsByCategory = mongoose.model("PostsByCategory", PostsByCategorySchema);

module.exports = PostsByCategory;