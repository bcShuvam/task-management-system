const Admin = require('../model/admin');
const Company = require('../model/company');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require('../model/user');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

const appUser = process.env.APP_USER;
const appPassword = process.env.APP_PASSWORD;
const defaultIssueImage = 'https://res.cloudinary.com/dfpxa2e7r/image/upload/v1742724107/uploads/hxygcajy4yau9xe8u16s.jpg';

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

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  secure: true,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload to Cloudinary helper
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const createCompany = async (req, res) => {
    try {
        const id = req.user.id;
        const isMainAdmin = req.user.isMainAdmin;

        if (!id) {
            return res.status(400).json({ message: "Admin ID is required" });
        }

        let {
            title,
            email,
            phone,
            address,
            industry,
            website,
            description,
            logo,
            mainAdminId,
            adminId,
        } = req.body;

        // Validate required fields
        if (!title || !email || !phone || !address || !industry) {
            return res.status(400).json({
                message: "Title, email, phone, address, and industry are required.",
            });
        }

        // Prevent invalid ObjectId casting
        if (adminId === "") adminId = undefined;
        if (mainAdminId === "") mainAdminId = undefined;

        // Set admin relationship logic
        mainAdminId = isMainAdmin ? id : mainAdminId;
        adminId = isMainAdmin ? adminId : id;

        // Ensure mainAdminId is valid
        if (!mainAdminId) {
            return res.status(400).json({ message: "Main Admin ID is required." });
        }

        // Check for existing company with the same email
        const foundCompany = await Company.findOne({ email });
        if (foundCompany) {
            return res.status(400).json({ message: "Company already exists." });
        }

        // Validate that mainAdmin exists
        const foundMainAdmin = await Admin.findById(mainAdminId);
        if (!foundMainAdmin) {
            return res.status(400).json({ message: "Main admin not found." });
        }

        if (req.file) {
            result = await uploadToCloudinary(req.file.buffer);
            logo = result.secure_url;
        } else {
            logo = issueImage || ''; // fallback if no file and no issueImage sent
        }

        // Create the company
        const newCompany = await Company.create({
            title,
            email,
            phone,
            address,
            industry,
            website,
            description,
            logo,
            mainAdminId,
            adminId,
        });

        // Update admin's company count
        foundMainAdmin.totalCompanies += 1;
        await foundMainAdmin.save();

        return res.status(201).json({
            message: "Company created successfully!",
            company: newCompany,
            totalCompanies: foundMainAdmin.totalCompanies,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
  createCompany,
  upload // Export multer middleware here
};