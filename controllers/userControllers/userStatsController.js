const Order = require('../../models/order');
const Product = require('../../models/product');
const Wishlist = require('../../models/wishlist');
const Joi = require("joi");
const { response } = require('../../utils/response');


const getUserCounts = async (req, res) => {
    try {
        const { id } = req.user; // logged-in user

        // Fetch counts in parallel
        const [orderCount, wishlistCount] = await Promise.all([
            Order.countDocuments({ user: id }),
            Wishlist.countDocuments({ user: id })
        ]);

        return response(res, 200, "User counts fetched successfully", {
            orderCount,
            wishlistCount
        });
    } catch (error) {
        console.error("Get user counts error:", error);
        return response(res, 500, "Internal Server Error");
    }
};

module.exports = {
    getUserCounts
};