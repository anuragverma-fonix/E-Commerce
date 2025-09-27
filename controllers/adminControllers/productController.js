const {response} = require('../../utils/response');
const Joi = require('joi');
const Category = require("../../models/category");
const Product = require("../../models/product");
const path = require('path');
const fs = require('fs').promises;

const createProduct = async(req,res) => {

    try{

        const {name,description,price,category,quantity,is_featured,video_url,rating} = req.body;
        const file = req.file;
        // console.log(req.body);

        const schema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            description: Joi.string().trim().default(""),
            price: Joi.number().min(0).required(),
            category: Joi.required(),
            quantity: Joi.required(),
            is_featured: Joi.required(),
            video_url: Joi.required(),
            rating: Joi.required(),
        });

        const {error,value} = schema.validate({name,description,price,category,quantity,is_featured,video_url,rating});

        if(error){
            if (file) await fs.unlink(file.path); // Delete uploaded file if validation fails
            return response(res, 400, "Bad Request");
        }

        const categoryExists = await Category.findById(category);
        // console.log(categoryExists);

        if(!categoryExists){
            if (file) await fs.unlink(file.path);
            return response(res, 400, "Category Details Not Found!");
        }

        // $regex + 'i' for case-insensitive match
        const existingProduct = await Product.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });

        if (existingProduct) {
            if (file) await fs.unlink(file.path);
            return response(res, 400, "Product with this name already exists");
        }

        const product = await Product.create({
            name,
            description,
            price,
            category: categoryExists._id,
            quantity: quantity,
            is_featured: is_featured,
            video_url: video_url,
            rating: rating,
            image: file ? file.path : null,
            status: "active",
        })

        return response(res, 200, "Product Created Successfully", product);

    }catch(error){
        console.log("create-product error:", error);
        return response(res, 500, "Internal Server Error");
    }
}

const updateProduct = async(req,res) => {

    try{

        const {name,description,price,quantity,is_featured,video_url,rating,status,category} = req.body;
        const {id} = req.params;
        const file = req.file;
        // console.log(req.body);
        // console.log(id);
        

        const product = await Product.findById(id);
        // console.log(product);

        if (!product) {
            if (file) await fs.unlink(file.path);
            return response(res, 404, "Product not found");
        }

        const schema = Joi.object({
            name: Joi.string().min(3).max(30),
            description: Joi.string().trim(),
            price: Joi.number().min(0),
            video_url: Joi.string(),
            rating: Joi.number().min(0).max(5)
        });

        const {error,value} = schema.validate({name,description,price,video_url,rating});

        if(error){
            if (file) await fs.unlink(file.path);
            return response(res, 400, "Bad Request");
        }

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (quantity !== undefined) product.quantity = quantity;
        if (is_featured !== undefined) product.is_featured = is_featured;
        if (video_url !== undefined) product.video_url = video_url;
        if (rating !== undefined) product.rating = rating;
        if (status !== undefined) product.status = status;
        if (category !== undefined) product.category = category;

        if (file) {
            if (product.image) {

                const oldImagePath = path.resolve(product.image); 

                await fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Failed to delete old image:", err);
                });
            }
            product.image = file.path;
        }

        const updatedProduct = await product.save();
        // console.log(updatedProduct);

        return response(res, 200, "Product Updated Successfully", updatedProduct);

    }catch(error){
        console.error("Update product error:", error);
        response(res, 500, "Internal Server Error");
    }
}

const deleteProduct = async(req,res) => {

    try{
        const {id} = req.params;
        // console.log(id);

        const product = await Product.findById(id);
        // console.log(product);

        if (!product) {
            return response(res, 404, "Product not found");
        }

        await Product.deleteOne({_id:id});

        return response(res, 200, "Product Deleted Successfully");

    }catch(error){
        console.error("Delete product error:", error);
        response(res, 500, "Internal Server Error");
    }
}


module.exports = {
    createProduct,
    updateProduct,
    deleteProduct
}