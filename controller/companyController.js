const Company = require('../model/company');
const CompanyUser = require('../model/companyUser');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dean42328@gmail.com",
    pass: "ypdfyswvmbzxtscp",
  },
});

const generateOTP = async () => crypto.randomInt(100000, 999999).toString();

const createCompany = async (req, res) => {
    try {
        const { adminId } = req.query;
        // if(!adminId) return res.status(400).json({message: "Admin Id is required"});
        const { companyName, email, phone, address, industry, website, description, companyLogo } = req.body;
        if (!companyName || !email || !phone || !address || !industry) return res.status(400).json({ message: 'companyName, email, phone, address and industry are required.' });
        const foundCompany = await Company.findOne({ email });
        if(foundCompany) return res.status(400).json({message: `Company already exists`});
        const newCompany = await Company.create({
            companyName,
            email,
            phone,
            address,
            industry,
            website,
            description,
            companyLogo,
            adminId
        });
        return res.status(201).json({message: 'Company created successfully!', company: newCompany});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const createCompanyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, adminId, email, phone, department, designation, role, roleValue, password } = req.body;

        if (!id) return res.status(400).json({ message: 'companyId is required' });
        if (!name || !email || !phone || !role || !password)
            return res.status(400).json({ message: 'name, email, adminId, phone, role, roleValue, password are required' });

        const foundUser = await CompanyUser.findOne({ email });
        if (foundUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPwd = await bcrypt.hash(password, 10);

        const newUser = await CompanyUser.create({
            name,
            adminId,
            companyId: id,
            email,
            phone,
            role,
            designation,
            department,
            roleValue,
            password: hashedPwd,
        });

        // Send welcome email with credentials
        await transporter.sendMail({
            from: "dean42328@gmail.com",
            to: email,
            subject: "Welcome to Task Management System",
            text: `Hello ${name},

            Welcome to Task Management System (TMS)!

            Your account has been successfully created. You can now log in using the credentials below:

            📧 Email: ${email}
            🔐 Password: ${password}

            📱 Download the TMS app:
            - Android (Play Store): https://play.google.com/store/apps/details?id=your.app.id
            - iOS (App Store): https://apps.apple.com/app/idYOUR_APP_ID

            We recommend changing your password after your first login for security purposes.

            If you have any questions or need assistance, feel free to contact our support team.

            Best regards,  
            The TMS Team`
        });

        // Bonus: Clean up response - remove password
        const userToSend = newUser.toObject();
        delete userToSend.password;

        return res.status(201).json({ message: 'User created successfully.', user: userToSend });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Get all companies
const getAllCompanies = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const companies = await Company.find({adminId: id});
        return res.status(200).json(companies);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get all company users
const getAllCompanyUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const users = await CompanyUser.find({companyId: id}).populate('companyId');
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getCompanyUsernames = async (req, res) => {
    try {
        const { id } = req.params;
        const users = await CompanyUser.find({ companyId: id });

        const filteredUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            department: user.department,
            designation: user.designation,
            adminId: user.adminId,
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
        const { id } = req.params;
        const updatedCompany = await Company.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedCompany) return res.status(404).json({ message: "Company not found" });
        return res.status(200).json({ message: "Company updated successfully", company: updatedCompany });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Update company user by ID
const updateCompanyUser = async (req, res) => {
    try {
        const { id } = req.params;

        // If password is being updated, hash it
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await CompanyUser.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Delete company by ID
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
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
        const user = await CompanyUser.findById(id).populate('companyId');
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Delete company user by ID
const deleteCompanyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await CompanyUser.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "User deleted successfully" });
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