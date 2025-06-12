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
const verifyRoles = require('../middleware/verifyRoles');

// Company routes
router.post('/create', createCompany, verifyRoles("Admin"));
router.get('/all', getAllCompanies, verifyRoles("Admin"));
router.get('/:id', getCompanyById, verifyRoles("Admin"));
router.put('/update/:id', updateCompany, verifyRoles("Admin"));
router.delete('/delete/:id', deleteCompany, verifyRoles("Admin"));

// CompanyUser routes
router.post('/user/create/:id', createCompanyUser);
router.get('/user/:id', getAllCompanyUsers);
router.get('/usernames/:id', getCompanyUsernames);
router.get('/user/:id', getCompanyUserById);
router.put('/user/update/:id', updateCompanyUser);
router.delete('/user/delete/:id', deleteCompanyUser);

module.exports = router;