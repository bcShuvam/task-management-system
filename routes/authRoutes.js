const express = require("express");
const router = express.Router();
const {registerSuperAdmin, registerAdmin, verifyOTP, resendOTP, login, logout, dashboard} = require('../controller/authController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyRole = require('../middleware/verifyRoles');

router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

router.post('/register/super-admin', registerSuperAdmin);
router.post('/register/admin', verifyJWT, verifyRole('Super Admin'), registerAdmin);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard', verifyJWT, dashboard);

module.exports = router;