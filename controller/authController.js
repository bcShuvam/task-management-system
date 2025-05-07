const User = require('../model/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require("bcrypt");

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dean42328@gmail.com',
        pass: 'ypdfyswvmbzxtscp'
    }
});

const generateOTP = async () => crypto.randomInt(100000, 999999).toString();

const register = async (req, res) => {
    try {
        let { name, email, password, role, phone, subscription, subscriptionStatus } = req.body;
        if (!name || !email || !password || !role || !phone) return res.status(400).json({ message: 'name, email, password, role and phone are required' });
        let user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: 'User already exists' });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        password = await bcrypt.hash(password, 10);

        if(!subscription){
            subscription = ''
        }else{
            subscriptionStatus = true
        }

        user = new User({ name, email, password, otp, otpExpiry, phone, role, subscription, subscriptionStatus });
        await user.save();

        await transporter.sendMail({
            from: 'dean42328@gmail.com',
            to: email,
            subject: 'OTP verification',
            text: `Your OTP is ${otp}`
        });

        return res.status(201).json({ message: 'User registered. Please verify otp sent to email.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        if (user.otp !== otp || user.otpExpiry < new Date()) return res.status(400).json({ message: `Invalid or Expired OTP ${new Date()}` });

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });

        const otp = await generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await transporter.sendMail({
            from: 'dean42328@gmail.com',
            to: email,
            subject: 'Resend OPT Verification',
            text: `Your new OTP is ${otp}`
        });

        return res.status(200).json({ message: `OTP resent successful, user.otpExpiry ${user.otpExpiry}` });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: 'User not found'});
        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(400).json({message: 'Incorrect password'});

        if(!user.isVerified) return res.status(400).json({message: 'Email not verified. Please verify OTP.'});
        req.session.user = {id: user._id, email: user.email, name: user.name};
        return res.status(200).json({message: 'Login successful'});
    } catch (err) {
        return res.status(500).json({message: 'Error logging in', error: err.message});
    }
}

// Logout User
const logout = async (req, res) => {
    req.session.destroy((err) => {
        if(err) return res.status(500).json({message: 'Error logging out'});
        return res.status(200).json({message: 'Logged out successfully'});
    })
}

const dashboard = async (req,res) => {
    try {
        return res.status(200).json({message: `Welcome to the dashboard, ${req.session.user.name}`});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

module.exports = {register, verifyOTP, resendOTP, login, logout, dashboard};