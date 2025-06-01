const express = require('express');
const router = express.Router();
const {
    createCompany,
    createCompanyUser,
    getAllCompanies,
    getCompanyUsernames,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getAllCompanyUsers,
    getCompanyUserById,
    updateCompanyUser,
    deleteCompanyUser
} = require('../controller/companyController');

// Company routes
router.post('/create/:id', createCompany);
router.get('/all/:id', getAllCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

// CompanyUser routes
router.post('/user/:id', createCompanyUser);
router.get('/user/:id', getAllCompanyUsers);
router.get('/usernames/:id', getCompanyUsernames);
router.get('/user/:id', getCompanyUserById);
router.put('/user/:id', updateCompanyUser);
router.delete('/user/:id', deleteCompanyUser);

module.exports = router;