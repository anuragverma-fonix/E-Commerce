const { types } = require('joi');
const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({

    name: {
        type: String,
        unique: true,
    },
    description: { 
        type: String 
    }, 
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ["active","inactive"],
    }

}, 
{
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
});

const Category = mongoose.model("tbl_Category", categorySchema);
module.exports = Category;