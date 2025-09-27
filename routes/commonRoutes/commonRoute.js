const express = require("express");
const router = express.Router();
const multer = require('multer');

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
  login
} = require("../../controllers/common/authController");

const { 
  getCategory, 
  getAllCategories 
} = require("../../controllers/common/categoryController")

const {
  viewOrder,
  getOrdersByUserId
} = require('../../controllers/common/orderController');

//Auth APIs
router.post('/register',profileUpload.single('profileImage'), register);
router.post('/login', login);

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