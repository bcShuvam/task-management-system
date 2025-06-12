const express = require('express');
const router = express.Router();
const { getSubCategories, createSubCategory, deleteSubCategory,updateSubCategory } = require('../controller/categoryController');

router.get('/:id', getSubCategories);
router.post('/create', createSubCategory);
router.put('/update/:id', updateSubCategory);
router.delete('/delete/:id', deleteSubCategory);

module.exports = router;