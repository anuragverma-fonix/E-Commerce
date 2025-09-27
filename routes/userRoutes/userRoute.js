const express = require("express");
const router = express.Router();

//Import Middlewares
const { auth } = require('../../middlewares/authMiddleware');

const { 
    createReview, 
    getProductReviews,
    updateReview,
    deleteReview
} = require("../../controllers/userControllers/userController");

const { placeOrder, cancelOrder } = require('../../controllers/userControllers/orderController');

const { 
    createWishlist,
    getWishlist,
    removeProductFromWishlist,
    clearWishlist
} = require('../../controllers/userControllers/wishlistController');

const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require('../../controllers/userControllers/cartController')

//Order APIs
router.post('/create-order', auth, placeOrder); //socket
router.post('/cancel-order/:id', auth, cancelOrder);

//Rating-Review APIs
router.post('/create-review/:id', auth, createReview);
router.get('/get-product-reviews/:id', auth, getProductReviews);
router.put('/update-product-review/:id', auth, updateReview);
router.delete('/delete-product-review/:id', auth, deleteReview);

//Wishlist APIs
router.post('/create-wishlist', auth, createWishlist);
router.get('/get-wishlist', auth, getWishlist);
router.put('/update-wishlist/:id', auth, removeProductFromWishlist);
router.delete('/clear-wishlist', auth, clearWishlist);

//Cart APIs
router.get('/cart', auth, getCart);
router.post('/add-to-cart', auth, addToCart);
router.put('/update-cart', auth, updateCartItem);
router.delete('/remove-from-cart/:id', auth, removeCartItem);
router.delete('/clear-cart', auth, clearCart);

module.exports = router;