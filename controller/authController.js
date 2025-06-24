const SuperAdmin = require("../model/superAdmin");
const Admin = require("../model/admin");
const User = require("../model/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Subscription = require('../model/subscription');
const jwt = require('jsonwebtoken');
const appUser = process.env.APP_USER;
const appPassword = process.env.APP_PASSWORD;

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: appUser,
        pass: appPassword,
        // user: "dean42328@gmail.com",
        // pass: "ypdfyswvmbzxtscp", // App password
    },
});

// OTP Generator
const generateOTP = () => crypto.randomInt(100000, 999999).toString();


const registerSuperAdmin = async (req, res) => {
    try {
        let {
            name,
            email,
            password,
            role,
            phone,
            gender,
            address,
            profileImage,
        } = req.body;

        if (!name || !email || !password || !role || !phone || !gender) {
            return res.status(400).json({
                message: "name, email, password, role, gender and phone are required",
            });
        }

        const foundSuperAdmin = await SuperAdmin.findOne({email});
        if (foundSuperAdmin)
            return res.status(400).json({ message: "email already exists" });

        const plainPassword = password;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new SuperAdmin({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            phone,
            profileImage,
            gender,
            address,
        });

        await newUser.save();

        // Send welcome email
        await transporter.sendMail({
            // from: "dean42328@gmail.com",
            from: appUser,
            to: email,
            subject: "Welcome to Task Management System",
            text: `Hello ${name},

        Welcome to Task Management System (TMS)!

        Your account has been successfully created. You can now log in using the credentials below:

        📧 Email: ${email}
        🔐 Password: ${plainPassword}
        👨‍💼 Role: ${role}

        📱 Download the TMS app: 
        - Android (Play Store): coming soon on play store
        - iOS (App Store): coming soon on app store

        We recommend changing your password after your first login for security purposes.

        If you have any questions, feel free to reach out.

        Best regards,  
        The TMS Team`,
        });

        return res.status(201).json({
            message:
                "User registered successfully. Please check your email for login details.",
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const registerAdmin = async (req, res) => {
    try {
        console.log(req.user);
        const superAdminId = req.user.id;

        let {
            name,
            email,
            password,
            role,
            phone,
            gender,
            address,
            profileImage,
            subscriptionId,
            discountRate,
            isMainAdmin,
            totalCompanies,
            totalAdmins,
            totalUsers,
            activationDate,
            expirationDate,
            totalDaysRemaining,
        } = req.body;

        if (!name || !email || !password || !role || !phone || !subscriptionId || !activationDate || !expirationDate || !gender) {
            return res.status(400).json({
                message: "name, email, password, role, phone, gender, subscriptionId, activationDate and expirationDate are required",
            });
        }

        const existingUser = await Admin.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const plainPassword = password;
        const hashedPassword = await bcrypt.hash(password, 10);

        const foundSuperAdmin = await SuperAdmin.findById(superAdminId);
        if(!foundSuperAdmin) return res.status(400).json({message: 'Super Admin not found'});
        const AssignedSubscription = await Subscription.findById(subscriptionId);
        if(!AssignedSubscription) return res.status(400).json({message: 'Subscription not found'});

        const newUser = new Admin({
            superAdminId: isMainAdmin === true ? superAdminId : null,
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            phone,
            gender,
            address,
            profileImage,
            subscriptionId,
            isMainAdmin,
            totalCompanies,
            totalAdmins,
            totalUsers,
            activationDate,
            expirationDate,
            totalDaysRemaining,
            discountRate
        });

        //    subscriptionId: isMainAdmin === true ? subscriptionId : null,
        //     isMainAdmin,
        //     totalCompanies: isMainAdmin === true ? totalCompanies : null,
        //     totalAdmins: isMainAdmin === true ? totalAdmins : null,
        //     totalUsers: isMainAdmin === true ? totalUsers : null,
        //     activationDate: isMainAdmin === true ? activationDate : null,
        //     expirationDate: isMainAdmin === true ? expirationDate : null,
        //     totalDaysRemaining: isMainAdmin === true ? totalDaysRemaining : null,
        //     discountRate: isMainAdmin === true ? discountRate : null,

        foundSuperAdmin.totalEarnings += AssignedSubscription.price;
        foundSuperAdmin.totalSales += 1;
        foundSuperAdmin.totalActiveSales += 1;

        AssignedSubscription.totalEarning += AssignedSubscription.price;
        AssignedSubscription.totalSubscriptionSold += 1;

        await newUser.save();
        await foundSuperAdmin.save();
        await AssignedSubscription.save();

        // Send welcome email
        await transporter.sendMail({
            // from: "dean42328@gmail.com",
            from: appUser,
            to: email,
            subject: "Welcome to Task Management System",
            text: `Hello ${name},

        Welcome to Task Management System (TMS)!

        Your account has been successfully created. You can now log in using the credentials below:

        📧 Email: ${email}
        🔐 Password: ${plainPassword}

        📱 Download the TMS app: 
        - Android (Play Store): coming soon on play store
        - iOS (App Store): coming soon on app store

        We recommend changing your password after your first login for security purposes.

        If you have any questions, feel free to reach out.

        Best regards,  
        The TMS Team`,
        });

        return res.status(201).json({
            message:
                "User registered successfully. Please check your email for login details.", superAdmin: foundSuperAdmin
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const superAdmin = await SuperAdmin.findOne({ email });
        const admin = await Admin.findOne({ email });
        const user = await User.findOne({ email });

        if (!superAdmin && !admin && !user)
            return res.status(400).json({ message: "User not found" });

        if (superAdmin?.isVerified || admin?.isVerified || user?.isVerified)
            return res.status(400).json({ message: "User already verified" });

        const otpValid =
            (superAdmin && superAdmin.otp === otp && superAdmin.otpExpiry > new Date()) ||
            (admin && admin.otp === otp && admin.otpExpiry > new Date()) ||
            (user && user.otp === otp && user.otpExpiry > new Date());

        if (!otpValid) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        if (superAdmin) {
            superAdmin.isVerified = true;
            superAdmin.otp = undefined;
            superAdmin.otpExpiry = undefined;
            await superAdmin.save();
        }
        
        if (admin) {
            admin.isVerified = true;
            admin.otp = undefined;
            admin.otpExpiry = undefined;
            await admin.save();
        }

        if (user) {
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
        }

        return res
            .status(200)
            .json({ message: "Email verified successfully. You can now log in." });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const superAdmin = await SuperAdmin.findOne({ email });
        const admin = await Admin.findOne({ email });
        const user = await User.findOne({ email });

        if (!superAdmin && !admin && !user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (superAdmin?.isVerified || admin?.isVerified || user?.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        const otp = await generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (superAdmin) {
            superAdmin.otp = otp;
            superAdmin.otpExpiry = expiry;
            await superAdmin.save();
        }

        if (admin) {
            admin.otp = otp;
            admin.otpExpiry = expiry;
            await admin.save();
        }

        if (user) {
            user.otp = otp;
            user.otpExpiry = expiry;
            await user.save();
        }

        await transporter.sendMail({
            // from: "dean42328@gmail.com",
            from: appUser,
            to: email,
            subject: "Verify Your Task Management System Account",
            text: `Hello,

        Thank you for registering with Task Management System (TMS).

        To complete your registration, use the OTP below to verify your account:

        🔐 OTP: ${otp}

        This code is valid for 10 minutes. Do not share it with anyone.

        If you didn’t request this, ignore this email.

        Best regards,  
        The TMS Team`,
        });

        return res.status(200).json({
            message: `OTP resent successfully. It expires at ${expiry}`,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        console.log(appUser);
        console.log(appPassword);
        const { email, password } = req.body;

        const superAdmin = await SuperAdmin.findOne({ email });
        const admin = await Admin.findOne({ email });
        const user = await User.findOne({ email });

        // Helper to generate and send OTP
        const sendOTP = async (userObj, type = "User") => {
            const otp = await generateOTP();
            userObj.otp = otp;
            userObj.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await userObj.save();

            await transporter.sendMail({
                // from: "dean42328@gmail.com",
                from: appUser,
                to: email,
                subject: `OTP Verification - ${type} Account`,
                text: `Hello ${userObj.name},\n\nTo complete your login to the Task Management System (TMS), please use the OTP below:\n\n🔐 OTP: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn’t initiate this request, please ignore this email.\n\nBest regards,\nThe TMS Team`
            });
        };

        if (superAdmin) {
            const match = await bcrypt.compare(password, superAdmin.password);
            if (!match)
                return res.status(400).json({ message: "Incorrect password" });

            if (!superAdmin.isVerified) {
                await sendOTP(superAdmin, "User");
                return res.status(400).json({
                    message: "Email not verified. OTP has been sent again.",
                    isVerified: false,
                });
            }

            const payload = {
                id: superAdmin._id,
                email: superAdmin.email,
                name: superAdmin.name,
                role: superAdmin.role
            }

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            const cleanUser = superAdmin.toObject();
            delete cleanUser.password;

            return res
                .status(200)
                .json({ message: "Login successful", token, user: cleanUser });
        }

        if (admin) {
            const match = await bcrypt.compare(password, admin.password);
            if (!match)
                return res.status(400).json({ message: "Incorrect password" });

            if (!admin.isVerified) {
                await sendOTP(admin, "Company User");
                return res.status(400).json({
                    message: "Email not verified. OTP has been sent again.",
                    isVerified: false,
                });
            }

            const payload = {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                isMainAdmin: admin.isMainAdmin,
            }

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            const cleanCompanyUser = admin.toObject();
            delete cleanCompanyUser.password;

            return res
                .status(200)
                .json({ message: "Login successful", token, user: cleanCompanyUser });
        }
        
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (!match)
                return res.status(400).json({ message: "Incorrect password" });

            if (!user.isVerified) {
                await sendOTP(user, "Company User");
                return res.status(400).json({
                    message: "Email not verified. OTP has been sent again.",
                    isVerified: false,
                });
            }

            const payload = {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            const cleanCompanyUser = user.toObject();
            delete cleanCompanyUser.password;

            return res
                .status(200)
                .json({ message: "Login successful", token, user: cleanCompanyUser });
        }

        return res.status(400).json({ message: "User not found" });
    } catch (err) {
        console.error("Login error:", err);
        return res
            .status(500)
            .json({ message: "Error logging in", error: err.message });
    }
};

const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Error logging out" });
        return res.status(200).json({ message: "Logged out successfully" });
    });
};

const dashboard = async (req, res) => {
    try {
        return res.status(200).json({
            message: `Welcome to the dashboard, ${req.session.user?.name || "User"}`,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    registerSuperAdmin,
    registerAdmin,
    verifyOTP,
    resendOTP,
    login,
    logout,
    dashboard,
};