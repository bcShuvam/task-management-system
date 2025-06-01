const mongoose = require("mongoose");

const CompanySchema = mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  industry: { type: String, required: true },
  website: { type: String, default: "" },
  description: { type: String, default: "" },
  companyLogo: { type: String, default: "" },
  adminId: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});

const Company = mongoose.model("Company", CompanySchema);

module.exports = Company;
