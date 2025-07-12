const Issue = require('../model/issue');
const Comment = require('../model/comment');

const getComment = async (req, res) => {
    try {
        const issueId = req.params.id;
        if(!issueId) return res.status(400).json({message: "issueId is required"});

        const foundComments = await Comment.find({issueId});

        return res.status(200).json({message: foundComments.length === 0 ? 'Comments not found' : 'Comments found successfully', totalComments: foundComments.length, comments: foundComments});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

const postComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const issueId = req.params.id;
        const {comment, attachment} = req.body;
        if(!issueId || !comment) return res.status(400).json({message: "IssueId and comment is required"});

        const foundIssue = await Issue.findById(issueId);
        if(!foundIssue) return res.status(404).json({message: 'Issue not found'});

        const newComment = await Comment.create({
            issueId,
            userId,
            comment,
            attachment
        });

        foundIssue.totalComments += 1;
        await foundIssue.save();

        return res.status(201).json({message: 'Comment added successfully', comment: newComment});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

const replyComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const issueId = req.params.id;
        const { comment, attachment, repliedToId } = req.body;

        if (!issueId || !comment || !repliedToId) {
            return res.status(400).json({ message: "IssueId, comment, and repliedToId are required" });
        }

        const foundIssue = await Issue.findById(issueId);
        if (!foundIssue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const newReply = await Comment.create({
            issueId,
            userId,
            comment,
            attachment,
            isReply: true,
            repliedToId
        });

        foundIssue.totalComments += 1;
        await foundIssue.save();

        return res.status(201).json({ message: 'Reply added successfully', comment: newReply });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateComment = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const { comment, attachment } = req.body;

        if (!id || !comment) {
            return res.status(400).json({ message: 'Comment id and updated comment text are required' });
        }

        const foundComment = await Comment.findById(id);
        if (!foundComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (foundComment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own comments' });
        }

        foundComment.comment = comment;
        if (attachment !== undefined) {
            foundComment.attachment = attachment;
        }
        foundComment.edited = true;
        foundComment.modifiedAt = new Date();

        await foundComment.save();

        return res.status(200).json({ message: 'Comment updated successfully', comment: foundComment });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const id = req.params.id;
        if(!id) return res.status(400).json({message: 'Comment id is required'});

        const delComment = await Comment.findByIdAndDelete(id);

        if(!delComment) return res.status(404).json({message: 'Comment not found'});

        const issueId = delComment.issueId;
        const foundIssue = await Issue.findById(issueId);

        foundIssue.totalComments -= 1;
        await foundIssue.save();

        return res.status(200).json({message: 'Comment deleted successfully'});
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
}

module.exports = {getComment, postComment, replyComment, updateComment, deleteComment};