const mongoose = require('mongoose');

const AccessSchema = mongoose.Schema({
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
});

const UserSchema = mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    mainAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    totalIssueCreated: { type: Number, default: 0 },
    totalIssueSolved: { type: Number, default: 0 },
    companyAccess: { type: AccessSchema },
    userAccess: { type: AccessSchema },
    categoriesAccess: { type: AccessSchema },
    issueAccess: { type: AccessSchema },
    canAssignIssue: { type: Boolean, default: false },
    fbToken: { type: String, default: "" },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
