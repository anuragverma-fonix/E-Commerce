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
} = require('../../controllers/userControllers/cartController');

const {
    getUserCounts
} = require('../../controllers/userControllers/userStatsController');

const {
    createChat
} = require('../../controllers/userControllers/chatController');

//Swagger

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management APIs
 *   - name: Reviews
 *     description: Product reviews APIs
 *   - name: Wishlist
 *     description: Wishlist management APIs
 *   - name: Cart
 *     description: Shopping cart APIs
 */


/**
 * @swagger
 * /user/create-order:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/cancel-order/{id}:
 *   post:
 *     summary: Cancel an existing order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Order ID to cancel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /user/create-review/{id}:
 *   post:
 *     summary: Create a review for a product
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review created
 */

/**
 * @swagger
 * /user/get-product-reviews/{id}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */

/**
 * @swagger
 * /user/update-product-review/{id}:
 *   put:
 *     summary: Update a product review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 */

/**
 * @swagger
 * /user/delete-product-review/{id}:
 *   delete:
 *     summary: Delete a product review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */


/**
 * @swagger
 * /user/create-wishlist:
 *   post:
 *     summary: Add products to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [
 *                   "68d6ac91d9820d672736913f",
 *                   "68d6acb0d9820d6727369142"
 *                 ]
 *     responses:
 *       200:
 *         description: Products added to wishlist
 */


/**
 * @swagger
 * /user/get-wishlist:
 *   get:
 *     summary: Get all wishlist items
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wishlist items
 */

/**
 * @swagger
 * /user/update-wishlist/{id}:
 *   put:
 *     summary: Remove a product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist item removed
 */

/**
 * @swagger
 * /user/clear-wishlist:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared
 */


/**
 * @swagger
 * /user/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User cart retrieved
 */

/**
 * @swagger
 * /user/add-to-cart:
 *   post:
 *     summary: Add a product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_Id:
 *                 type: string
 *               quantity:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to cart
 */

/**
 * @swagger
 * /user/update-cart:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart updated
 */

/**
 * @swagger
 * /user/remove-from-cart/{id}:
 *   delete:
 *     summary: Remove a product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Cart item ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from cart
 */

/**
 * @swagger
 * /user/clear-cart:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */

/**
 * @swagger
 * /user/user-stats:
 *   get:
 *     summary: Get user's order and wishlist counts
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User counts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "User counts fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderCount:
 *                       type: integer
 *                       example: 5
 *                     wishlistCount:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */


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
router.delete('/delete-wishlist/:id', auth, removeProductFromWishlist);
router.delete('/clear-wishlist', auth, clearWishlist);

//Cart APIs
router.get('/cart', auth, getCart);
router.post('/add-to-cart', auth, addToCart);
router.put('/update-cart', auth, updateCartItem);
router.delete('/remove-from-cart/:id', auth, removeCartItem);
router.delete('/clear-cart', auth, clearCart);

//Chat
router.post('/create-chat', auth, createChat);

//User Stats
router.get('/user-stats', auth, getUserCounts);

module.exports = router;