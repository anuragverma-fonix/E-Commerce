const Product = require("../../models/product");
const { response } = require("../../utils/response");
const Joi = require("joi");
const path = require('path');
const fs =  require("fs");
require('dotenv').config();
const bcrypt = require('bcrypt');

const getAllProduct = async(req,res) => {

    try{

        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        let sort = req.query.sort ;
        let priceFrom = Number(req.query.priceFrom) || 0;
        let priceTo = Number(req.query.priceTo) || 1000000;
        const categoryId = req.query.categoryId;
        // console.log(page, limit);
        
        
        const skip = (page - 1) * limit;

        const filter = {
            price: { $gte: priceFrom, $lte: priceTo },
        };
        
        if (categoryId) {
            filter.category = categoryId;
        }

        let sortOption;

        if(sort) sortOption = { price: sort === "desc" ? -1 : 1 };

        const totalItems = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / limit);

        const products = await Product.find(filter)
        .populate("category", "name")
        .skip(skip)
        .limit(limit)
        .sort(sortOption);
        // console.log(products);

        const productsData = products.map(product => {
            
        const obj = product.toObject();

        if (obj.image) {
            obj.image = `${process.env.BASE_URL}${obj.image.replace(/\\/g, '/')}`;
        }
            return obj;
        });

        return response(res, 200, "Product fetched Successfully", {
            products: productsData,
            pagination: {
                limit,
                page,
                totalItems,
                totalPages,
            }
            
        });

    }catch(error){
        console.log("get-all-product error:", error);
        response(res, 500, "Internal Server Error");
    }
}

const getProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return response(res, 404, "Product not found");
        }

        const productData = product.toObject();

        if (productData.image) {
            productData.image = `${process.env.BASE_URL}${productData.image.replace(/\\/g, '/')}`;
        }

        return response(res, 200, "Product fetched successfully", productData);

    } catch (error) {
        console.error("Get product by ID error:", error);
        response(res, 500, "Internal Server Error");
    }
}

module.exports = {
    getAllProduct,
    getProduct,
}