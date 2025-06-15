const express = require('express');
const router = express.Router();
const { getMyIssue, getCompanyIssues, applyIssue, deleteIssue  } = require('../controller/issueController');
const issueController = require('../controller/createIssueController');

router.get('/my/:id', getMyIssue);
router.get('/company/:id', getCompanyIssues);
router.post(
  '/create/:id',
  issueController.upload.single('issueImage'),  // ✅ This is crucial
  issueController.createIssue
);
router.put('/apply/:id', applyIssue);
router.delete('/delete/:id', deleteIssue);

module.exports = router;