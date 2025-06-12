const mongoose = require("mongoose");

const SocialMediaSchema = mongoose.Schema({
  facebook: {type: String, default: ""},
  instagram: {type: String, default: ""},
  whatsapp: {type: String, default: ""},
  github: {type: String, default: ""},
  linkedIn: {type: String, default: ""},
  website: {type: String, default: ""},
})

const CompanySchema = mongoose.Schema({
  title: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  industry: { type: String, required: true },
  website: { type: String, default: "" },
  description: { type: String, default: "" },
  logo: { type: String, default: "" },
  totalUsers: {type: Number, default: 0},
  totalIssues: {type: Number, default: 0},
  totalSolvedIssue: {type: Number, default: 0},
  totalPendingIssue: {type: Number, default: 0},
  mainAdminId: {type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true},
  adminId: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});

const Company = mongoose.model("Company", CompanySchema);

module.exports = Company;
