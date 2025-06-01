const Category = require('../model/category');
const SubCategory = require('../model/subCategory');
const mongoose = require('mongoose');
const User = require('../model/user');

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
        const { categoryName, description, adminId } = req.body;
        if (!categoryName || !adminId) return res.status(400).json({ message: 'Category and adminId are required' });
        const foundAdmin = await User.findById(adminId);
        if (!foundAdmin) return res.status(400).json({ message: `${categoryName} already exists` });
        const newCategory = await Category.create({
            adminId,
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
        const { adminId, subCategoryName, description, categoryId } = req.body;
        if (!adminId || !subCategoryName || !categoryId) return res.status(400).json({ message: 'subCategory and categoryId is required' });
        const foundAdmin = await User.findById(adminId);
        if (!foundAdmin) return res.status(400).json({ message: `admin not found` });
        const foundCategory = await Category.findById(categoryId);
        if (!foundCategory) return res.status(400).json({ message: `category not found` });
        const newCategory = await SubCategory.create({
            adminId,
            subCategoryName,
            description,
            categoryId,
        });
        return res.status(201).json({ message: 'Category created successfully!', category: newCategory });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const updateCategory = async (req, res) => {
    try {
        const categoryId = req.query;
        const { } = req.body;
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.query;
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
        const { id } = req.query;
        if (!id) return res.status(400).json({ message: 'Category id is required' });
        const deleteSubCat = await SubCategory.findByIdAndDelete(id);
        if (!deleteSubCat) return res.status(400).json({ message: 'id not found' });

        return res.status(200).json({ message: 'Subcategory deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { getCategories, getSubCategories, createCategory, createSubCategory, deleteCategory, deleteSubCategory };