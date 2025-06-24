const express = require('express');
const router = express.Router();

const {test, test2} = require('../controller/test');

router.route('/success').get(test);
router.route('/2').get(test2);

module.exports = router;