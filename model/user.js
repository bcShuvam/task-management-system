const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    subscription: { type: String, default: "" },
    subscriptionStatus: {type: Boolean, default: false},
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;