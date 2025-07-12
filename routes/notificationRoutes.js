const express = require('express');
const router = express.Router();
const { registerFirebaseToken, sendNotification } = require('../controller/sendNotificationController');

router.post('/token/register', registerFirebaseToken);
router.post('/send', sendNotification)

module.exports = router;