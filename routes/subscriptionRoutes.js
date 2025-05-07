const express = require('express');
const router = express.Router();

const {createSubscription, getAllSubscriptions}= require('../controller/subscriptionController');

router.post('/create', createSubscription);
router.get('/all-subscrtiption', getAllSubscriptions);

module.exports = router;