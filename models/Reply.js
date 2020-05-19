const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const autopopulate = require("mongoose-autopopulate"); 

const ReplySchema = new Schema({
    body: {
        type: String, 
        required: true
    },
    date_created: { type: String, default: Date(Date.now()).toString() },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        autopopulate: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        autopopulate: true
    },
    category: {
        type: Schema.Types.ObjectId, 
        ref: "Category",
        autopopulate: true
    },
    points: Number
});

ReplySchema.plugin(autopopulate); 

const Reply = mongoose.model("Reply", ReplySchema);

module.exports = Reply;
