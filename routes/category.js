const express = require('express');
const router = express.Router();
const { getCategories, createCategory, createSubCategory, deleteCategory, deleteSubCategory, updateCategory } = require('../controller/categoryController');

router.get('/:id', getCategories);
router.post('/create', createCategory);
router.put('/update/:id', updateCategory);
router.delete('/delete/:id', deleteCategory);

module.exports = router;