const mongoose = require("mongoose");

const autopopulate = require("mongoose-autopopulate"); 

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { 
    type: String,
    required: true
  }, 
  description: { 
    type: String, 
    required: true
  },
  subcategories: [ 
    { 
      type: Schema.Types.ObjectId,
      ref: "Subcategory", 
      autopopulate:true 
    } 
  ] 
});

CategorySchema.plugin(autopopulate); 

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
