const express = require('express');
const router = express.Router();
const { getSubCategories, createSubCategory, deleteSubCategory } = require('../controller/categoryController');

router.get('/:id', getSubCategories);
router.post('/create', createSubCategory);
router.delete('/delete', deleteSubCategory);

module.exports = router;