const mongoose = require("mongoose");

const autopopulate = require("mongoose-autopopulate"); 

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
        autopopulate: true 
    }, 
    posts: [ 
    { 
        type: Schema.Types.ObjectId,
        ref: "Post", 
        autopopulate:true 
    } 
  ] 
});

SubcategorySchema.plugin(autopopulate); 

const Subcategory = mongoose.model("Subcategory", SubcategorySchema);

module.exports = Subcategory;
