const mongoose = require('mongoose');

const SubCategorySchema = mongoose.Schema({
    adminId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    subCategoryName: { type: String, required: true, unique: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, default: "" }
});

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = SubCategory;