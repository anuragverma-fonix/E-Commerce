const Category = require("../../models/category");
const { response } = require("../../utils/response");
require('dotenv').config();

const getCategory = async (req, res) => {
    try {

        const { id } = req.params;
        // console.log(id);

        const category = await Category.findById(id);

        if (!category) return response(res, 404, "Category not found");

        const categoryData = category.toObject(); // convert Mongoose document to plain object

        if (categoryData.image) {
            categoryData.image = `${process.env.BASE_URL}${categoryData.image.replace(/\\/g, '/')}`;
        }

        return response(res, 200, "Category fetched successfully", categoryData);

    } catch (err) {
        console.error("Get Category By ID Error:", err);
        return response(res, 500, "Internal Server Error");
    }
};

const getAllCategories = async (req, res) => {
    try {
        
        const categories = await Category.find().sort({ createdAt: -1 }); // latest first (DESC)

        const categoryData = categories.map(cat => {

            const obj = cat.toObject();

            if (obj.image) {
                obj.image = `${process.env.BASE_URL}${obj.image.replace(/\\/g, '/')}`;
            }
            
            return obj;
        });

        return response(res, 200, "Categories fetched successfully", categoryData);

    } catch (err) {
        console.error("Get All Categories Error:", err);
        return response(res, 500, "Internal Server Error");
    }
};

module.exports = {
    getCategory,
    getAllCategories
}