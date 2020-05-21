const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const ReplySchema = new Schema({
    body: {
        type: String, 
        required: true
    },
    date_created: { type: String, default: Date(Date.now()).toString() },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: Schema.Types.ObjectId, 
        ref: "Category",
    },
    points: Number
});

const Reply = mongoose.model("Reply", ReplySchema);

module.exports = Reply;
