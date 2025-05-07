const express = require("express");
const router = express.Router();
const {register, verifyOTP, resendOTP, login, logout, dashboard} = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard', authMiddleware, dashboard);

module.exports = router;