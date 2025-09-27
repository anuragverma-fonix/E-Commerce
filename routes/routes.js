const express = require('express');
const router = express.Router();


const adminRoutes = require('../routes/adminRoutes/adminRoutes')
const commonRoutes = require('../routes/commonRoutes/commonRoute')
const userRoutes = require('../routes/userRoutes/userRoute')

router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/', commonRoutes);

module.exports = router;