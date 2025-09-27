const Wishlist = require('../../models/wishlist');
const User = require('../../models/users');
const Product = require('../../models/product');
const { response } = require('../../utils/response');


const createWishlist = async (req, res) => {

    try {

        const userId = req.user.id;
        const { products } = req.body; // array of product IDs

        if (!products || !products.length) {
            return response(res, 400, "Products are required");
        }

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {

            wishlist = await Wishlist.create({
                user: userId,
                products,
            });
            
        } else {
            // Add products to wishlist (!duplicates)
            products.forEach(productId => {
                if (!wishlist.products.includes(productId)) {
                    wishlist.products.push(productId);
                }
            });

            await wishlist.save();

        }

        wishlist = await wishlist.populate("products", "name price image");

        return response(res, 200, "Wishlist updated successfully", wishlist);

    } catch (err) {

        console.error("Create Wishlist Error:", err);
        return response(res, 500, "Internal Server Error");

    }
};

const getWishlist = async (req, res) => {

    try {

        const userId = req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId }).populate("products", "name price image");

        if (!wishlist) return response(res, 404, "Wishlist not found");

        return response(res, 200, "Wishlist fetched successfully", wishlist);

    } catch (err) {

        console.error("Get Wishlist Error:", err);
        return response(res, 500, "Internal Server Error");

    }
};

const removeProductFromWishlist = async (req, res) => {

    try {

        const userId = req.user.id;
        const productId = req.params.id;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) return response(res, 404, "Wishlist not found");

        wishlist.products = wishlist.products.filter(p => p.toString() !== productId);

        await wishlist.save();

        return response(res, 200, "Product removed from wishlist", wishlist);

    } catch (err) {

        console.error("Remove Wishlist Product Error:", err);
        return response(res, 500, "Internal Server Error");

    }
};

const clearWishlist = async (req, res) => {

    try {
        const userId = req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) return response(res, 404, "Wishlist not found");

        wishlist.products = [];
        await wishlist.save();

        return response(res, 200, "Wishlist cleared successfully");

    } catch (err) {

        console.error("Clear Wishlist Error:", err);
        return response(res, 500, "Internal Server Error");

    }
};

module.exports = {
    createWishlist,
    getWishlist,
    removeProductFromWishlist,
    clearWishlist,
}