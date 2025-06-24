const Admin = require('../model/admin');
const Company = require('../model/company');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require('../model/user');
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

const generateOTP = async () => crypto.randomInt(100000, 999999).toString();

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

const createCompanyUser = async (req, res) => {
    try {
        const companyId = req.params.id;
        if (!companyId) {
            return res.status(400).json({ message: 'companyId is required' });
        }

        // Find company by ID to validate
        const foundCompany = await Company.findById(companyId);
        if (!foundCompany) {
            return res.status(400).json({ message: 'Company not found' });
        }

        // Destructure only expected fields
        const {
            name,
            mainAdminId,
            adminId,
            email,
            phone,
            gender,
            address,
            role,
            department,
            designation,
            password,
            companyAccess = {},
            userAccess = {},
            categoriesAccess = {},
            issueAccess = {},
            canAssignIssue = false
        } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !role || !gender || !address || !department || !designation || !mainAdminId || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const foundMainAdmin = await Admin.findById(mainAdminId);
        if (!foundMainAdmin) return res.status(400).json({ message: 'Main Admin not found' });

        let foundAdmin;

        if (adminId && adminId.trim() !== "") {
            foundAdmin = await Admin.findById(adminId);
            if (!foundAdmin) return res.status(400).json({ message: 'Admin not found' });
        }

        // Check for duplicate email
        const foundUser = await User.findOne({ email });
        if (foundUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPwd = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            adminId: adminId || null,
            companyId,
            mainAdminId,
            name,
            email,
            phone,
            gender,
            address,
            role,
            designation,
            department,
            companyAccess,
            userAccess,
            categoriesAccess,
            issueAccess,
            canAssignIssue,
            password: hashedPwd,
        });

        // Update company user count
        foundCompany.totalUsers += 1;
        await foundCompany.save();

        if (role == 'Admin User' && foundMainAdmin && foundAdmin) {
            foundMainAdmin.totalAdmins += 1;
            foundAdmin.totalAdmins += 1;
            await foundMainAdmin.save();
            await foundAdmin.save();
        }

        if (role == 'User' && foundMainAdmin && foundAdmin) {
            foundMainAdmin.totalUsers += 1;
            foundAdmin.totalUsers += 1;
            await foundMainAdmin.save();
            await foundAdmin.save();
        }

        if (role == 'Admin User' && foundMainAdmin) {
            foundMainAdmin.totalAdmins += 1;
            await foundMainAdmin.save();
        }

        if (role == 'User' && foundMainAdmin) {
            foundMainAdmin.totalUsers += 1;
            await foundMainAdmin.save();
        }

        // Remove password from response
        const userToSend = newUser.toObject();
        delete userToSend.password;
        const updatedUser = {
            mainTotalUser: foundMainAdmin.totalUsers ?? 0,
            mainTotalAdminUser: foundMainAdmin.totalAdmins ?? 0,
            mainTotalCompany: foundMainAdmin.totalCompanies ?? 0,
            mainTotalPost: foundMainAdmin.totalPost ?? 0,

            adminTotalUser: foundAdmin?.totalUsers ?? 0,
            adminTotalAdminUser: foundAdmin?.totalAdmins ?? 0,
            adminTotalCompany: foundAdmin?.totalCompanies ?? 0,
            adminTotalPost: foundAdmin?.totalPost ?? 0,
        }

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
            🔐 Password: ${password}

            📱 Download the TMS app:
            - Android: coming soon
            - iOS: coming soon

            We recommend changing your password after your first login.

            Best regards,  
            The TMS Team`
        });

        return res.status(201).json({ message: 'User created successfully.', updatedUser, user: userToSend });
    } catch (err) {
        console.error("Error in createCompanyUser:", err);
        return res.status(500).json({ message: err.message });
    }
};

// Get all companies
const getAllCompanies = async (req, res) => {
    try {
        const id = req.user.id;
        console.log(id);
        const companies = await Company.find({ $or: [{ mainAdminId: id }, { adminId: id }] })
        // const companies = await Company.find({adminId: id });
        return res.status(200).json({ message: companies.length === 0 ? 'No company found' : 'Company found', companies });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get all company users
const getAllCompanyUsers = async (req, res) => {
    try {
        const id = req.params.id;
        const role = req.query.role;

        // Base condition: users must have either matching companyId or mainAdminId
        const baseCondition = {
            $or: [
                { companyId: id },
                { mainAdminId: id }
            ]
        };

        let query = {};

        // Add role condition only if role !== "All"
        if (role === 'All') {
            query = baseCondition;
        } else {
            query = {
                $and: [
                    baseCondition,
                    { role: role }
                ]
            };
        }

        const users = await User.find(query).populate('companyId');
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found', users: [] });
        }

        return res.status(200).json({ users: users });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getCompanyUsernames = async (req, res) => {
    try {
        const { id } = req.params;
        const users = await User.find({ companyId: id });

        const filteredUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            department: user.department,
            designation: user.designation,
            adminId: user.adminId,
            mainAdminId: user.mainAdminId
        }));

        return res.status(200).json(filteredUsers);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// Get a single company by ID
const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id);
        if (!company) return res.status(404).json({ message: "Company not found" });
        return res.status(200).json(company);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Update company by ID
const updateCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        console.log("Updating company with ID:", companyId);

        // Define allowed fields only
        const {
            title,
            email,
            phone,
            address,
            industry,
            website,
            description,
            logo,
            adminId,
            mainAdminId
        } = req.body;

        // Build sanitized update object
        const updateData = {};

        if (title) updateData.title = title;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (industry) updateData.industry = industry;
        if (website) updateData.website = website;
        if (description) updateData.description = description;
        if (logo) updateData.logo = logo;

        // Validate and assign ObjectId fields
        const mongoose = require("mongoose");

        if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
            updateData.adminId = adminId;
        }

        if (mainAdminId && mongoose.Types.ObjectId.isValid(mainAdminId)) {
            updateData.mainAdminId = mainAdminId;
        }

        console.log("Sanitized update data:", updateData);

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: "Company not found" });
        }

        return res.status(200).json({
            message: "Company updated successfully",
            company: updatedCompany
        });

    } catch (err) {
        console.error("Error updating company:", err.message);
        return res.status(500).json({ message: err.message });
    }
};

// Update company user by ID
const updateCompanyUser = async (req, res) => {
    try {
        const _id = req.params.id;

        // Fetch existing user
        const existingUser = await User.findById(_id);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const oldRole = existingUser.role;
        const mainAdminId = existingUser.mainAdminId;
        const foundMainAdmin = await Admin.findById(mainAdminId);
        if (!foundMainAdmin) {
            return res.status(404).json({ message: 'Main Admin not found' });
        }

        // Check if new email is unique (if provided and changed)
        if (req.body.email && req.body.email !== existingUser.email) {
            const emailExists = await User.findOne({ email: req.body.email, _id: { $ne: _id } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use by another user' });
            }
        }

        // Check if new phone is unique (if provided and changed)
        if (req.body.phone && req.body.phone !== existingUser.phone) {
            const phoneExists = await User.findOne({ phone: req.body.phone, _id: { $ne: _id } });
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone number already in use by another user' });
            }
        }

        // Prepare update object
        const updateData = {};

        // Loop through body and assign valid fields
        for (const key in req.body) {
            if (
                req.body[key] !== undefined &&
                req.body[key] !== null &&
                req.body[key] !== ''
            ) {
                updateData[key] = req.body[key];
            }
        }

        // Handle password hashing if password is being updated
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Perform update
        const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
            new: true, // return updated document
            runValidators: true, // ensure validation rules still apply
        });

        // Role change adjustments
        const newRole = updatedUser.role;
        if (oldRole !== newRole) {
            if (oldRole === 'User' && newRole === 'Admin User') {
                foundMainAdmin.totalAdmins += 1;
                foundMainAdmin.totalUsers -= 1;
            } else if (oldRole === 'Admin User' && newRole === 'User') {
                foundMainAdmin.totalAdmins -= 1;
                foundMainAdmin.totalUsers += 1;
            }
            await foundMainAdmin.save();
        }

        return res.status(200).json({
            message: 'User has been updated',
            user: updatedUser,
            totalAdmins: foundMainAdmin.totalAdmins,
            totalUsers: foundMainAdmin.totalUsers
        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: err.message });
    }
};

// Delete company by ID
const deleteCompany = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedCompany = await Company.findByIdAndDelete(id);
        if (!deletedCompany) return res.status(404).json({ message: "Company not found" });
        return res.status(200).json({ message: "Company deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get a single company user by ID
const getCompanyUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user.findById(id).populate('companyId');
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Delete company user by ID
const deleteCompanyUser = async (req, res) => {
    try {
        const _id = req.params.id;
        if(!_id) return res.status(400).json({message: 'Id is required'});

        // Step 1: Find the user first
        const foundUser = await User.findById(_id);
        if (!foundUser) return res.status(404).json({ message: "User not found" });

        const foundMainAdmin = await Admin.findById(foundUser.mainAdminId);
        if (foundMainAdmin) {
            if (foundUser.role === "Admin User") {
                foundMainAdmin.totalAdmins -= 1;
            } else if (foundUser.role === "User") {
                foundMainAdmin.totalUsers -= 1;
            }

            // Step 2: Delete the user
            await User.findByIdAndDelete(_id);
            await foundMainAdmin.save();
        }

        return res.status(200).json({
            message: "User deleted successfully", totalAdmins: foundMainAdmin.totalAdmins,
            totalUsers: foundMainAdmin.totalUsers
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createCompany,
    createCompanyUser,
    getAllCompanies,
    getAllCompanyUsers,
    getCompanyUsernames,
    getCompanyUserById,
    getCompanyById,
    updateCompany,
    updateCompanyUser,
    deleteCompany,
    deleteCompanyUser
};