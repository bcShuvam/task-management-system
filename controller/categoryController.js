const Category = require('../model/category');
const SubCategory = require('../model/subCategory');
const mongoose = require('mongoose');
const Admin = require('../model/admin');
const Company = require('../model/company');

const getCategories = async (req, res) => {
    try {
        const adminId = req.params.id;
        const foundCategory = await Category.find({ adminId });
        return res.status(200).json({
            message: foundCategory.length ? 'Categories found' : 'No categories found',
            categories: foundCategory
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getSubCategories = async (req, res) => {
    try {
        const categoryId = req.params.id;
        console.log(categoryId);
        console.log(req.params);
        const foundSubCategories = await SubCategory.find({ categoryId });

        return res.status(200).json({
            message: foundSubCategories.length ? 'Sub Categories found' : 'No sub categories found',
            subcategories: foundSubCategories
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


const createCategory = async (req, res) => {
    try {
        const { categoryName, description, adminId, companyId } = req.body;
        if (!categoryName || !adminId || !companyId) return res.status(400).json({ message: 'Category, adminId and companyId are required' });

        const foundAdmin = await Admin.findById(adminId);
        if (!foundAdmin) return res.status(400).json({ message: `Admin not found exists` });

        const foundCompany = await Company.findById(companyId);
        if (!foundCompany) return res.status(400).json({ message: `Company not found` });

        const newCategory = await Category.create({
            adminId,
            companyId,
            categoryName,
            description
        });
        return res.status(201).json({ message: 'Category created successfully!', category: newCategory });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const createSubCategory = async (req, res) => {
    try {
        const { adminId, companyId, subCategoryName, description, categoryId } = req.body;
        if (!adminId || !subCategoryName || !categoryId || !companyId) return res.status(400).json({ message: 'companyId, subCategory and categoryId is required' });
        const foundAdmin = await Admin.findById(adminId);
        if (!foundAdmin) return res.status(400).json({ message: `admin not found` });
        const foundCategory = await Category.findById(categoryId);
        if (!foundCategory) return res.status(400).json({ message: `category not found` });
        const newCategory = await SubCategory.create({
            adminId,
            companyId,
            categoryId,
            subCategoryName,
            description,
        });
        return res.status(201).json({ message: 'Category created successfully!', category: newCategory });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: 'Category ID is required' });

        const foundCategory = await Category.findById(id);
        if (!foundCategory) return res.status(404).json({ message: 'Category not found' });

        const { categoryName, description, adminId, companyId } = req.body;

        // Update only provided fields, keep existing otherwise
        foundCategory.categoryName = categoryName || foundCategory.categoryName;
        foundCategory.description = description || foundCategory.description;
        foundCategory.adminId = adminId || foundCategory.adminId;
        foundCategory.companyId = companyId || foundCategory.companyId;

        const updatedCategory = await foundCategory.save();
        return res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateSubCategory = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: 'SubCategory ID is required' });

        const foundSubCategory = await SubCategory.findById(id);
        if (!foundSubCategory) return res.status(404).json({ message: 'SubCategory not found' });

        const { subCategoryName, description, adminId, categoryId, companyId } = req.body;

        // Update only provided fields, keep existing otherwise
        foundSubCategory.subCategoryName = subCategoryName || foundSubCategory.subCategoryName;
        foundSubCategory.description = description || foundSubCategory.description;
        foundSubCategory.adminId = adminId || foundSubCategory.adminId;
        foundSubCategory.categoryId = categoryId || foundSubCategory.categoryId;
        foundSubCategory.companyId = companyId || foundSubCategory.companyId;

        const updatedSubCategory = await foundSubCategory.save();
        return res.status(200).json({ message: 'SubCategory updated successfully', subCategory: updatedSubCategory });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        if (!categoryId) return res.status(400).json({ message: 'Category id is required' });
        const deleteCat = await Category.findByIdAndDelete(categoryId);
        if (!deleteCat) return res.status(400).json({ message: 'Category id not found' });
        const deleteSubCat = await SubCategory.deleteMany({ categoryId });

        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const deleteSubCategory = async (req, res) => {
    try {
        const id  = req.params.id;
        if (!id) return res.status(400).json({ message: 'Category id is required' });
        const deleteSubCat = await SubCategory.findByIdAndDelete(id);
        if (!deleteSubCat) return res.status(400).json({ message: 'id not found' });

        return res.status(200).json({ message: 'Subcategory deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { getCategories, getSubCategories, createCategory, createSubCategory, deleteCategory, deleteSubCategory, updateCategory, updateSubCategory };