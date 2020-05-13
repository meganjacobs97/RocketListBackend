const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autopopulate = require("mongoose-autopopulate"); 

const PostSchema = new Schema({
    title: {
        type: String,
        required: true 
    },
    body: String,
    date_created: { type: String, default: Date.now.toString() },
    is_locked: {
        type: Boolean, 
        required: true 
    }, 
    points: Number,
    subcategory: { 
        type: Schema.Types.ObjectId,
        ref: "Subcategory",
        autopopulate: true 
    }, 
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        autopopulate: true
    },
    replies: [{
        type: Schema.Types.ObjectId, 
        ref: "Reply",
        autopopulate: true 
    }]
});

PostSchema.plugin(autopopulate); 

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
