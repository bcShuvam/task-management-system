const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    issueId: {type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    comment: {type: String, required: true},
    attachment: {type: String, default: ""},
    likes: {type: Number, default: 0},
    dislikes: {type: Number, default: 0},
    createdAt: {type: Date, default: new Date},
    modifiedAt: {type: Date, required: false},
    edited: {type: Boolean, default: false},
    isReply: {type: Boolean, default: false},
    repliedToId: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: false}
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;