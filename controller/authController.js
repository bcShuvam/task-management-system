const User = require("../model/user");
const CompanyUser = require("../model/companyUser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "dean42328@gmail.com",
        pass: "ypdfyswvmbzxtscp", // App password
    },
});

// OTP Generator
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const register = async (req, res) => {
    try {
        let {
            name,
            email,
            password,
            role,
            phone,
            subscription,
            subscriptionStatus,
        } = req.body;

        if (!name || !email || !password || !role || !phone) {
            return res.status(400).json({
                message: "name, email, password, role and phone are required",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const plainPassword = password;
        const hashedPassword = await bcrypt.hash(password, 10);

        if (!subscription) {
            subscription = "";
            subscriptionStatus = false;
        } else {
            subscriptionStatus = true;
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            subscription,
            subscriptionStatus,
            // isVerified: true,
        });

        await newUser.save();

        // Send welcome email
        await transporter.sendMail({
            from: "dean42328@gmail.com",
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
                "User registered successfully. Please check your email for login details.",
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        const companyUser = await CompanyUser.findOne({ email });

        if (!user && !companyUser)
            return res.status(400).json({ message: "User not found" });

        if (user?.isVerified || companyUser?.isVerified)
            return res.status(400).json({ message: "User already verified" });

        const otpValid =
            (user && user.otp === otp && user.otpExpiry > new Date()) ||
            (companyUser &&
                companyUser.otp === otp &&
                companyUser.otpExpiry > new Date());

        if (!otpValid) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        if (user) {
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
        }

        if (companyUser) {
            companyUser.isVerified = true;
            companyUser.otp = undefined;
            companyUser.otpExpiry = undefined;
            await companyUser.save();
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

        const user = await User.findOne({ email });
        const companyUser = await CompanyUser.findOne({ email });

        if (!user && !companyUser) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user?.isVerified || companyUser?.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        const otp = await generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (user) {
            user.otp = otp;
            user.otpExpiry = expiry;
            await user.save();
        }

        if (companyUser) {
            companyUser.otp = otp;
            companyUser.otpExpiry = expiry;
            await companyUser.save();
        }

        await transporter.sendMail({
            from: "dean42328@gmail.com",
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
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        const companyUser = await CompanyUser.findOne({ email });

        // Helper to generate and send OTP
        const sendOTP = async (userObj, type = "User") => {
            const otp = await generateOTP();
            userObj.otp = otp;
            userObj.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await userObj.save();

            await transporter.sendMail({
                from: "dean42328@gmail.com",
                to: email,
                subject: `OTP Verification - ${type} Account`,
                text: `Hello ${userObj.name},\n\nTo complete your login to the Task Management System (TMS), please use the OTP below:\n\n🔐 OTP: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn’t initiate this request, please ignore this email.\n\nBest regards,\nThe TMS Team`
            });
        };

        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (!match)
                return res.status(400).json({ message: "Incorrect password" });

            if (!user.isVerified) {
                await sendOTP(user, "User");
                return res.status(400).json({
                    message: "Email not verified. OTP has been sent again.",
                    isVerified: false,
                });
            }

            req.session.user = {
                id: user._id,
                email: user.email,
                name: user.name,
            };

            const cleanUser = user.toObject();
            delete cleanUser.password;

            return res
                .status(200)
                .json({ message: "Login successful", user: cleanUser });
        }

        if (companyUser) {
            const match = await bcrypt.compare(password, companyUser.password);
            if (!match)
                return res.status(400).json({ message: "Incorrect password" });

            if (!companyUser.isVerified) {
                await sendOTP(companyUser, "Company User");
                return res.status(400).json({
                    message: "Email not verified. OTP has been sent again.",
                    isVerified: false,
                });
            }

            req.session.user = {
                id: companyUser._id,
                email: companyUser.email,
                name: companyUser.name,
            };

            const cleanCompanyUser = companyUser.toObject();
            delete cleanCompanyUser.password;

            return res
                .status(200)
                .json({ message: "Login successful", user: cleanCompanyUser });
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
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    dashboard,
};