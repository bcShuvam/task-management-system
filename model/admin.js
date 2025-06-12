const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    superAdminId: {type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin'},
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    gender: {type: String, required: true},
    address: {type: String, required: ""},
    role: { type: String, required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    discountRate: {type: Number, default: 0},
    isMainAdmin: { type: Boolean, default: false },
    totalCompanies: {type: Number, default: 0},
    totalAdmins: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    totalPost: {type: Number, default: 0},
    activationDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
    extendedDate: { type: Date },
    totalDaysRemaining: { type: Number },
    isExpired: { type: Boolean, default: false },
    isExtended: { type: Boolean, default: false },
    profileImage: { type: String, default: "https://res.cloudinary.com/dfpxa2e7r/image/upload/v1742724107/uploads/xrxak1efn47qho6aw4a7.png" },
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;