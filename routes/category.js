const express = require('express');
const router = express.Router();
const { getCategories, createCategory, createSubCategory, deleteCategory, deleteSubCategory, } = require('../controller/categoryController');

router.get('/:id', getCategories);
router.post('/create', createCategory);
router.post('/create/subcategory', createSubCategory);
router.delete('/delete', deleteCategory);
router.delete('/delete/subcategory', deleteSubCategory);

module.exports = router;