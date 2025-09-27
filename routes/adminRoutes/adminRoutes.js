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
router.put('/orders-status/:id', auth, isAdmin, orderStatus);
router.put('/delete-order/:id', auth, isAdmin, deleteOrder);
router.get('/dashboard-stats', auth, isAdmin, dashboardStats) //work here

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