const mongoose = require("mongoose");

const autopopulate = require("mongoose-autopopulate"); 

const Schema = mongoose.Schema;

const PointsByCategorySchema = new Schema({
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
    points: Number 
}) 

PointsByCategorySchema.plugin(autopopulate); 

const PointsByCategory = mongoose.model("PointsByCategory", PointsByCategorySchema);

module.exports = PointsByCategory;