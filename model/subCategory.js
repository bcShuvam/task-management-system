const mongoose = require('mongoose');
const Company = require('./company');

const SubCategorySchema = mongoose.Schema({
    adminId : {type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true},
    companyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true},
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryName: { type: String, required: true, unique: true },
    description: { type: String, default: "" }
});

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = SubCategory;