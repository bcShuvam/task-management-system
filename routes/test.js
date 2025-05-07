const express = require('express');
const router = express.Router();

const test = require('../controller/test');

router.route('/success').get(test);''

module.exports = router;