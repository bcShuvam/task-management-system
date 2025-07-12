const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, default: false },
    role: { type: String, required: true },
    totalSales: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalActiveSales: { type: Number, default: 0 },
    profileImage: { type: String, default: "https://res.cloudinary.com/dfpxa2e7r/image/upload/v1742724107/uploads/xrxak1efn47qho6aw4a7.png" },
    fbToken: { type: String, default: "" },
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false }
});

const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);

module.exports = SuperAdmin;