const mongoose = require('mongoose');

const IssueSchema = mongoose.Schema({
    mainAdminId: {type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true},
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: {type: mongoose.Schema.Types.ObjectId, ref: 'TicketNumber'},
    ticketNumber: {type: Number, default: 0},
    issueDetails: { type: String, default: '' },
    issueImage: {type: String, default: 'https://res.cloudinary.com/dfpxa2e7r/image/upload/v1742724107/uploads/hxygcajy4yau9xe8u16s.jpg'},
    issueVoiceMessage: {type: String, default: ''},
    issueStatus: { type: String, default: 'Unassigned' },
    isAssigned: { type: Boolean, default: false },
    assignedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    issueOpenDatetime: { type: Date, default: new Date },
    issueDeadlineDateTime: { type: Date, required: true },
    issueAssignedDatetime: { type: Date, required: false },
    onProgress: { type: Boolean, default: false },
    issueSolvedDatetime: { type: Date, required: false },
    comment: { type: String, default: '' },
    totalTime: { type: Number, default: 0 },
    approvalStatus: { type: Boolean, default: false },
    feedback: { type: String, default: '' }
});

const Issue = mongoose.model('Issue', IssueSchema);

module.exports = Issue;