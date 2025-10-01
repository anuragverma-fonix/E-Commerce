const express = require("express");
const router = express.Router();
const multer = require('multer');
const { getOrCreateChat } = require('../../utils/chat');

//Middleware Imports
const { auth } = require('../../middlewares/authMiddleware');

//Controller Import
const { 
    fetchProfile, 
    updateProfile, 
    changePassword
} = require("../../controllers/common/fetchController");

const {
    getAllProduct, 
    getProduct
} = require('../../controllers/common/productController');

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

const profileStorage = multer.diskStorage({
    destination: function (req,file,cb){
        // if (!fs.existsSync("./uploads/category")) fs.mkdirSync("./uploads/category", { recursive: true });
      cb(null, "./uploads/profile")
    },
    filename: function (req, file, cb){
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '')}`);
    }
});

const profileUpload = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: fileFilter});

const {
  register,
  login,
  logout
} = require("../../controllers/common/authController");

const { 
  getCategory, 
  getAllCategories 
} = require("../../controllers/common/categoryController")

const {
  viewOrder,
  getOrdersByUserId
} = require('../../controllers/common/orderController');

//Swagger

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication APIs
 *   - name: Category
 *     description: Category APIs
 *   - name: Product
 *     description: Product APIs
 *   - name: Profile
 *     description: Profile APIs
 *   - name: Order
 *     description: Order APIs
 *   - name: Chat
 *     description: Chat system APIs
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User registered successfully
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /get-all-categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */

/**
 * @swagger
 * /get-category/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     tags: [Category]
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
 *         description: Category details
 */

/**
 * @swagger
 * /get-all-products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of products
 */

/**
 * @swagger
 * /get-product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */

/**
 * @swagger
 * /update-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /change-password:
 *   put:
 *     summary: Change password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */

/**
 * @swagger
 * /fetch-order/{id}:
 *   get:
 *     summary: Get a specific order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */

/**
 * @swagger
 * /fetch-all-orders:
 *   get:
 *     summary: Get all orders of logged-in user
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */

/**
 * @swagger
 * /start:
 *   post:
 *     summary: Start a chat with an admin
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat created or retrieved
 */


//Auth APIs
router.post('/register',profileUpload.single('profileImage'), register);
router.post('/login', login);
router.post('/logout', auth, logout);

//Category APIs
router.get("/get-all-categories", auth, getAllCategories);
router.get("/get-category/:id", auth, getCategory);

//Product APIs
router.get('/get-all-products', getAllProduct);
router.get('/get-product/:id', getProduct);

//Profile APIs
router.get('/profile', auth, fetchProfile);
router.put('/update-profile', profileUpload.single('profileImage'), auth, updateProfile);
router.put('/change-password', auth, changePassword);

//Order APIs
router.get('/fetch-order/:id', auth, viewOrder);
router.get('/fetch-all-orders', auth, getOrdersByUserId);

//Chat System
router.post("/start", auth, async (req, res) => {

  try {

    const userId = req.user.id;
    const { adminId } = req.body;

    const chat = await getOrCreateChat(userId, adminId);

    res.json(chat);

  } catch (err) {

    console.error("Error starting chat:", err);
    res.status(500).json({ error: "Server error" });

  }
});

module.exports = router;