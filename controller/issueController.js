const Admin = require('../model/admin');
const Company = require('../model/company');
const Issue = require('../model/issue');
const nodemailer = require("nodemailer");
const User = require('../model/user');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dean42328@gmail.com",
    pass: "ypdfyswvmbzxtscp",
  },
});

const remap = (arrayObj) => {
    return arrayObj.map(issue => ({
        _id: issue._id,
        companyId: issue.companyId,
        categoryId: issue.categoryId?._id || "",
        categoryName: issue.categoryId?.categoryName || "",
        subCategoryId: issue.subCategoryId?._id || "",
        subCategoryName: issue.subCategoryId?.subCategoryName || "",
        createdById: issue.createdById?._id || "",
        createdByName: issue.createdById?.name || "",
        assignedUserId: issue.assignedUserId?._id || "",
        assignedUserName: issue.assignedUserId?.name || "",
        issueDetails: issue.issueDetails || "",
        issueImage: issue.issueImage || "",
        issueVoiceMessage: issue.issueVoiceMessage || "",
        issueStatus: issue.issueStatus || "",
        isAssigned: issue.isAssigned || false,
        issueOpenDatetime: issue.issueOpenDatetime || "",
        issueDeadlineDateTime: issue.issueDeadlineDateTime || "",
        issueAssignedDatetime: issue.issueAssignedDatetime || "",
        onProgress: issue.onProgress || false,
        issueSolvedDatetime: issue.issueSolvedDatetime || "",
        comment: issue.comment || "",
        totalTime: issue.totalTime || 0,
        approvalStatus: issue.approvalStatus || false,
        feedback: issue.feedback || ""
    }));
}

const getMyIssue = async (req, res) => {
    try {
        const assignedUserId = req.params.id;
        if (!assignedUserId) return res.status(400).json({ message: 'userId is required' });

        const myIssues = await Issue.find({ assignedUserId })
            .populate('categoryId', 'categoryName')
            .populate('subCategoryId', 'subCategoryName')
            .populate('createdById', 'name')
            .populate('assignedUserId', 'name');

        // console.log(myIssues);

        const formattedRes = remap(myIssues);

        return res.status(200).json({
            message: myIssues.length ? 'Issue found successfully' : 'No Issue found',
            issues: formattedRes.reverse()
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getCompanyIssues = async (req, res) => {
    try {
        const companyId = req.params.id;
        if (!companyId) return res.status(400).json({ message: 'companyId is required' });

        const companyIssues = await Issue.find({ companyId })
            .populate('categoryId', 'categoryName')
            .populate('subCategoryId', 'subCategoryName')
            .populate('createdById', 'name')
            .populate('assignedUserId', 'name');

        // console.log(companyIssues);
        
        const formattedRes = remap(companyIssues);

        return res.status(200).json({
            message: companyIssues.length ? 'Issue found successfully' : 'No Issue found',
            issues: formattedRes.reverse()
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// const createIssue = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const {
//             mainAdminId,
//             companyId,
//             categoryId,
//             subCategoryId,
//             createdById,
//             issueDetails,
//             issueImage,
//             issueStatus,
//             isAssigned,
//             assignedUserId,
//             issueAssignedDatetime,
//             onProgress,
//             issueDeadlineDateTime
//         } = req.body;

//         // Basic validations
//         if (!userId) return res.status(400).json({ message: 'userId is required' });
//         if (!companyId || !categoryId || !subCategoryId || !issueDeadlineDateTime)
//             return res.status(400).json({ message: 'companyId, categoryId, subCategoryId and issueDeadlineDateTime are required' });

//         const foundCompany = await Company.findById(companyId);
//         if (!foundCompany) return res.status(400).json({ message: 'Company not found' });

//         const foundMainAdmin = await Admin.findById(mainAdminId);
//         if (!foundMainAdmin) return res.status(400).json({ message: 'Main admin not found' });

//         const foundCreator = await User.findById(createdById);
//         if (!foundCreator) return res.status(400).json({ message: 'Creator (createdById) not found' });

//         console.log('Check List Passed');

//         // Create the issue
//         const newIssue = await Issue.create({
//             mainAdminId,
//             companyId,
//             categoryId,
//             subCategoryId,
//             assignedUserId,
//             createdById,
//             issueDetails,
//             issueImage,
//             issueStatus: assignedUserId ? 'onProgress' : 'Unassigned',
//             isAssigned: !!assignedUserId,
//             issueAssignedDatetime: assignedUserId ? issueAssignedDatetime || new Date() : undefined,
//             onProgress: !!assignedUserId,
//             issueDeadlineDateTime
//         });

//         console.log('Issue Created');

//         if (!newIssue) return res.status(400).json({ message: 'Issue creation failed' });

//         // Increment counters
//         foundMainAdmin.totalPost += 1;
//         foundCompany.totalIssues += 1;

//         await foundMainAdmin.save();
//         await foundCompany.save();

//         // Populate related fields for email
//         const populatedIssue = await Issue.findById(newIssue._id)
//             .populate('assignedUserId', 'email name')
//             .populate('createdById', 'name')
//             .populate('categoryId', 'categoryName')
//             .populate('subCategoryId', 'subCategoryName');

//         // Send email if assigned
//         if (populatedIssue.assignedUserId?.email) {
//             const emailText = `Hello ${populatedIssue.assignedUserId.name},

//             You have been assigned a new issue in the Task Management System.

//             📌 Issue Details:
//             - Category: ${populatedIssue.categoryId?.categoryName || "N/A"}
//             - Subcategory: ${populatedIssue.subCategoryId?.subCategoryName || "N/A"}
//             - Description: ${populatedIssue.issueDetails || "N/A"}
//             - Deadline: ${issueDeadlineDateTime}

//             🧑‍💼 Assigned by: ${populatedIssue.createdById?.name || "Unknown"}

//             Please log in to the TMS system to view and manage this task.

//             Best regards,  
//             TMS Team`;

//             await transporter.sendMail({
//                 from: "dean42328@gmail.com",
//                 to: populatedIssue.assignedUserId.email,
//                 subject: "New Task Assigned to You in TMS",
//                 text: emailText
//             });
//         }

//         return res.status(201).json({ message: 'Issue created successfully', issue: populatedIssue });

//     } catch (err) {
//         console.error("Issue creation error:", err);
//         return res.status(500).json({ message: err.message });
//     }
// };


const applyIssue = async (req, res) => {
    try {
        const issueId = req.params.id;
        const { assignedUserId, comment } = req.body;

        if (!issueId) return res.status(400).json({ message: 'issueId is required' });
        if (!assignedUserId || !comment) return res.status(400).json({ message: 'assignedUserId and comment are required' });

        const updateIssue = await Issue.findByIdAndUpdate(
            issueId,
            {
                assignedUserId,
                issueAssignedDatetime: new Date(),
                comment,
                isAssigned: true,
                issueStatus: 'onProgress',
                onProgress: true
            },
            { new: true, lean: true } // fast and returns a plain JS object
            );

        if (!updateIssue) return res.status(400).json({ message: 'Issue assign failed' });

        return res.status(200).json({ message: 'Issue assigned successfully', assignedTo: updateIssue });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const deleteIssue = async (req, res) => {
    try {
        const issueId = req.params.id;
        if (!issueId) return res.status(400).json({ message: 'issueId is required' });

        const delIssue = await Issue.findByIdAndDelete(issueId);
        if (!delIssue) return res.status(400).json({ message: 'Issue delete failed' });

        return res.status(200).json({ message: 'Issue deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { getMyIssue, getCompanyIssues, applyIssue, deleteIssue };