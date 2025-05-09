const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionsName,
  updateSubscription,
  deleteSubscription
} = require('../controller/subscriptionController');

router.post('/create', createSubscription);
router.get('/all', getAllSubscriptions);
router.get('/', getSubscriptionById);
router.get('/name', getSubscriptionsName);
router.put('/update', updateSubscription);
router.delete('/delete', deleteSubscription);

module.exports = router;
