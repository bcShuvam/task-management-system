const Admin = require('../model/admin');
const Company = require('../model/company');
const Issue = require('../model/issue');
const nodemailer = require("nodemailer");
const User = require('../model/user');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dean42328@gmail.com",
    pass: "ypdfyswvmbzxtscp",
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

const createIssue = async (req, res) => {
  try {
    const userId = req.params.id;

    // Now req.body will be populated by multer from form fields
    let {
      mainAdminId,
      companyId,
      categoryId,
      subCategoryId,
      createdById,
      issueDetails,
      issueImage,
      issueStatus,
      isAssigned,
      assignedUserId,
      issueAssignedDatetime,
      onProgress,
      issueDeadlineDateTime
    } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!companyId || !categoryId || !subCategoryId || !issueDeadlineDateTime)
      return res.status(400).json({ message: 'companyId, categoryId, subCategoryId and issueDeadlineDateTime are required' });

    const foundCompany = await Company.findById(companyId);
    if (!foundCompany) return res.status(400).json({ message: 'Company not found' });

    const foundMainAdmin = await Admin.findById(mainAdminId);
    if (!foundMainAdmin) return res.status(400).json({ message: 'Main admin not found' });

    const foundCreator = await User.findById(createdById);
    if (!foundCreator) return res.status(400).json({ message: 'Creator (createdById) not found' });

    console.log('Check List Passed');
    let result;

    // Upload image if exists in the request
    if (req.file) {
        result = await uploadToCloudinary(req.file.buffer);
      issueImage = result.secure_url;
    } else {
      issueImage = issueImage || ''; // fallback if no file and no issueImage sent
    }

    // console.log(result);

    // Create the issue
    const newIssue = await Issue.create({
      mainAdminId,
      companyId,
      categoryId,
      subCategoryId,
      assignedUserId,
      createdById,
      issueDetails,
      issueImage,
      issueStatus: assignedUserId ? 'onProgress' : 'Unassigned',
      isAssigned: !!assignedUserId,
      issueAssignedDatetime: assignedUserId ? issueAssignedDatetime || new Date() : undefined,
      onProgress: !!assignedUserId,
      issueDeadlineDateTime
    });

    console.log('Issue Created');

    if (!newIssue) return res.status(400).json({ message: 'Issue creation failed', });

    // Increment counters
    foundMainAdmin.totalPost += 1;
    foundCompany.totalIssues += 1;

    await foundMainAdmin.save();
    await foundCompany.save();

    // Populate related fields for email
    const populatedIssue = await Issue.findById(newIssue._id)
      .populate('assignedUserId', 'email name')
      .populate('createdById', 'name')
      .populate('categoryId', 'categoryName')
      .populate('subCategoryId', 'subCategoryName');

    // Send email if assigned
    if (populatedIssue.assignedUserId?.email) {
      const emailText = `Hello ${populatedIssue.assignedUserId.name},

        You have been assigned a new issue in the Task Management System.

        📌 Issue Details:
        - Category: ${populatedIssue.categoryId?.categoryName || "N/A"}
        - Subcategory: ${populatedIssue.subCategoryId?.subCategoryName || "N/A"}
        - Description: ${populatedIssue.issueDetails || "N/A"}
        - Deadline: ${issueDeadlineDateTime}

        🧑‍💼 Assigned by: ${populatedIssue.createdById?.name || "Unknown"}

        Please log in to the TMS system to view and manage this task.

        Best regards,  
        TMS Team`;

      await transporter.sendMail({
        from: "dean42328@gmail.com",
        to: populatedIssue.assignedUserId.email,
        subject: "New Task Assigned to You in TMS",
        text: emailText
      });
    }

    return res.status(201).json({ message: 'Issue created successfully', result, issue: populatedIssue });

  } catch (err) {
    console.error("Issue creation error:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createIssue,
  upload // Export multer middleware here
};
