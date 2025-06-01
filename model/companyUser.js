const mongoose = require('mongoose');

const CompanyUserSchema = mongoose.Schema({
    name: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true }, // Renamed from "contact" to "phone"
    role: { type: String, required: true },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    roleValue: { type: Number, required: true },
    password: { type: String, required: true }
});

const CompanyUser = mongoose.model("CompanyUser", CompanyUserSchema);

module.exports = CompanyUser;
