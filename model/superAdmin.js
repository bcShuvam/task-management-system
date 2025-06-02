const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    subscriptionId: {type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true},
    subscriptionStatus: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    totalSales: {type: Number, default: 0},
    totalEarnings: {type: Number, default: 0},
    totalActiveSales: {type: Number, default: 0}
});

const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);

module.exports = SuperAdmin;