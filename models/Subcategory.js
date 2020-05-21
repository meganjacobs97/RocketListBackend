const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SubcategorySchema = new Schema({
    name: { 
        type: String,
        required: true
    }, 
    description: { 
        type: String, 
        required: true
    }, 
    category: { 
        type: Schema.Types.ObjectId,
        ref: "Category",
    }, 
    posts: [ 
    { 
        type: Schema.Types.ObjectId,
        ref: "Post", 
    } 
  ] 
});


const Subcategory = mongoose.model("Subcategory", SubcategorySchema);

module.exports = Subcategory;
