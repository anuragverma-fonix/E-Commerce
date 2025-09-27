const {response} = require('../../utils/response');
const Joi = require('joi');
const Category = require("../../models/category");
const path = require('path');
const fs = require('fs');

const createCategory = async(req,res) => {

    try{

        const {name,description,status} = req.body;
        const file = req.file;
        // console.log(name);
        // console.log(description);
        // console.log(file);

        const schema = Joi.object({
            name: Joi.string().min(3).max(30).required().messages({
                    "string.empty": "Name is required",
                    "string.min": "Name must be at least 3 characters",
                    "string.max": "Name must be at most 30 characters",
                }),
            description: Joi.string().trim().required().messages({
                    "string.empty": "Description is required",
                }),
        });

        const {error,value} = schema.validate({name,description},{ abortEarly: false });

        if(error){
            if (file) fs.unlinkSync(file.path);
            return response(res, 400, "Bad Request");
        }

        const existingCategory = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
        
        if (existingCategory) {
            if (file) fs.unlinkSync(file.path);
            return response(res, 400, "Category with this name already exists");
        }

        const createdCategory = await Category.create({
            name,
            description,
            image: file ? file.path : null,
            status: status? status : "active",
        })
        // console.log(createdCategory);

        return response(res, 200, "Product Created Successfully",createdCategory);

    }catch(error){
        console.log(error);
        return response(res, 500, "Internal Server Error");
    }
}


const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const file = req.file;

        const category = await Category.findById(id);
        if (!category) return response(res, 404, "Category not found");

        // Validation schema
        const schema = Joi.object({
            name: Joi.string().min(3).max(30).messages({
                "string.empty": "Name is required",
                "string.min": "Name must be at least 3 characters",
                "string.max": "Name must be at most 30 characters"
            }),
            description: Joi.string().trim().messages({
                "string.empty": "Description is required"
            })
        });

        const { error, value } = schema.validate({ name, description }, { abortEarly: false });
        if (error) {
            return response(res, 400, `Validation Error`);
        }

        // Explicit field assignments
        if (name !== undefined) category.name = name;
        if (description !== undefined) category.description = description;
        
        if (file) {
            if (category.image) {
                const oldImagePath = path.resolve(category.image); 
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Failed to delete old image:", err);
                });
            }
            category.image = file.path;
        }

        const updatedCategory = await category.save();

        return response(res, 200, "Category updated successfully", updatedCategory);

    } catch (err) {
        console.error("Update Category Error:", err);
        return response(res, 500, "Internal Server Error");
    }
};

const deleteCategory = async (req, res) => {
    try {

        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) return response(res, 404, "Category not found");

        // Delete image file if exists
        if (category.image) {

            const imagePath = path.resolve(category.image); // resolves full path

            if (fs.existsSync(imagePath)) {

                fs.unlink(imagePath, (err) => {

                    if (err) console.error("Failed to delete category image:", err);

                });

            }
        }

        await Category.deleteOne({ _id: id });

        return response(res, 200, "Category deleted successfully");
        
    } catch (err) {
        console.error("Delete Category Error:", err);
        return response(res, 500, "Internal Server Error");
    }
};

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory
}