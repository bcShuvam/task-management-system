const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    adminId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    categoryName: {type: String, required: true, unique: true},
    description: {type: String, default: ""}
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;