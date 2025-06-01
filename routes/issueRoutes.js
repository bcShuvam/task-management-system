const express = require('express');
const router = express.Router();
const { getMyIssue, getCompanyIssues, createIssue, applyIssue, deleteIssue  } = require('../controller/issueController');

router.get('/my/:id', getMyIssue);
router.get('/company/:id', getCompanyIssues);
router.post('/create/:id', createIssue);
router.put('/apply/:id', applyIssue);
router.delete('/delete/:id', deleteIssue);

module.exports = router;