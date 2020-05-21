const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PointsByCategorySchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    points: Number 
}) 

const PointsByCategory = mongoose.model("PointsByCategory", PointsByCategorySchema);

module.exports = PointsByCategory;