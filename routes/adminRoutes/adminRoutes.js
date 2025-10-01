const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require("fs");

//Middlewares Imports
const { auth, isAdmin } = require('../../middlewares/authMiddleware');

//Controller Imports
const { 
    createCategory, 
    getAllCategories, 
    getCategory, 
    updateCategory, 
    deleteCategory
} = require("../../controllers/adminControllers/categoryController");

const { 
    createProduct, 
    updateProduct, 
    deleteProduct
} = require("../../controllers/adminControllers/productController");

const { 
    viewOrder, 
    viewOrders, 
    orderStatus,
    deleteOrder,
    dashboardStats,
} = require("../../controllers/adminControllers/ordersController");


const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true); // Accept the file
  }
  // Reject the file with a descriptive error
  const error = new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF images are allowed.`);
  error.code = 'INVALID_FILE_TYPE';
  cb(error, false);
};
  
const categoryStorage = multer.diskStorage({
    destination: function (req,file,cb){
        // if (!fs.existsSync("./uploads/category")) fs.mkdirSync("./uploads/category", { recursive: true });
      cb(null, "./uploads/category")
    },
    filename: function (req, file, cb){
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '')}`);
    }
});

const productStorage = multer.diskStorage({
    destination: function (req,file,cb){
        // if (!fs.existsSync("./uploads/product")) fs.mkdirSync("./uploads/product", { recursive: true });
      cb(null, "./uploads/product")
    },
    filename: function (req, file, cb){
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '')}`);
    }
});

const categoryUpload = multer({ storage: categoryStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: fileFilter});
const productUpload = multer({ storage: productStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: fileFilter});

//Swagger

/**
 * @swagger
 * tags:
 *   - name: AdminCategory
 *     description: Admin Category APIs
 *   - name: AdminProduct
 *     description: Admin Product APIs
 *   - name: AdminOrder
 *     description: Admin Order Management APIs
 */

/**
 * @swagger
 * /admin/create-category:
 *   post:
 *     summary: Create a new category
 *     tags: [AdminCategory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryImage:
 *                 type: string
 *                 format: binary
 *               description:
 *                  type: string
 *               status:
 *                  type: string
 *     responses:
 *       200:
 *         description: Category created
 */

/**
 * @swagger
 * /admin/update-category/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [AdminCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated
 */

/**
 * @swagger
 * /admin/delete-category/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [AdminCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */

/**
 * @swagger
 * /admin/create-products:
 *   post:
 *     summary: Create a new product
 *     tags: [AdminProduct]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               productImage:
 *                 type: string
 *                 format: binary
 *               quantity:
 *                  type: string
 *               is_featured:
 *                  type: string
 *               video_url:
 *                  type: string
 *               category:
 *                  type: string
 *               rating:
 *                  type: string
 *     responses:
 *       200:
 *         description: Product created
 */

/**
 * @swagger
 * /admin/update-product/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [AdminProduct]
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
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               productImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 */

/**
 * @swagger
 * /admin/delete-product/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [AdminProduct]
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
 *         description: Product deleted
 */

/**
 * @swagger
 * /admin/fetch-orders:
 *   get:
 *     summary: Fetch all orders
 *     tags: [AdminOrder]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */

/**
 * @swagger
 * /admin/orders-status/{id}:
 *   put:
 *     summary: Update order status
 *     tags: [AdminOrder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "Shipped"
 *           example:
 *             status: "Shipped"
 *     responses:
 *       200:
 *         description: Order status updated
 */


/**
 * @swagger
 * /admin/delete-order/{id}:
 *   put:
 *     summary: Delete an order
 *     tags: [AdminOrder]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted
 */

/**
 * @swagger
 * /admin/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [AdminOrder]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User logged out successfully"
 *       401:
 *         description: Unauthorized (user not logged in or token invalid)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Please login first"
 */



//Category Routes
router.post('/create-category', auth, isAdmin, categoryUpload.single("categoryImage") , createCategory);
router.put("/update-category/:id", auth, isAdmin, categoryUpload.single("categoryImage"), updateCategory);
router.delete("/delete-category/:id", auth, isAdmin, deleteCategory);

//Products Routes
router.post('/create-products', auth, isAdmin, productUpload.single("productImage"), createProduct);
router.put('/update-product/:id', auth, isAdmin, productUpload.single("productImage"), updateProduct);
router.delete('/delete-product/:id', auth, isAdmin, deleteProduct);

//Order Routes
router.get('/fetch-orders', auth, isAdmin, viewOrders);
router.put('/orders-status/:id', auth, isAdmin, orderStatus); //socket
router.put('/delete-order/:id', auth, isAdmin, deleteOrder);
router.get('/dashboard-stats', auth, isAdmin, dashboardStats);

// Error handler for Multer
router.use((error, req, res, next) => {

    if (error.code === 'INVALID_FILE_TYPE') {
        
        return res.status(400).json({
            success: false,
            message: error.message,
            error: 'INVALID_FILE_TYPE'
        });
    }

    if (error instanceof multer.MulterError) {

        let message = 'File upload error';

        if (error.code === 'LIMIT_FILE_SIZE') {
            message = 'File size too large. Maximum allowed size is 5MB.';
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected field. Please Try again with image Only!';
        }

        return res.status(400).json({
            success: false,
            message,
            error: error.code
        });
    }

    next(error);
});

module.exports = router;