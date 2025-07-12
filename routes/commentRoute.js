const express = require('express');
const router = express.Router();

const {getComment, postComment, replyComment, updateComment, deleteComment} = require('../controller/commentController');

router.get('/:id', getComment);
router.post('/:id', postComment);
router.post('/:id', replyComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;