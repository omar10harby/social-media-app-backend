import express from "express";
import Comment from "../models/Comments.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

//add comment
router.post("/:postId", authMiddleware, async (req, res) => {
  try {
    const post = await Comment.findById(req.params.postId);
    const comment = new Comment({
      text,
      user: req.user.id,
      post: req.params.postId,
    });
    await comment.save();
    const populated = await comment.populate("user", "name avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// get comments
router.get("/:postId", authMiddleware, async (req, res) => {
  try {
    const comment = await Comments.find({ post: req.params.postId })
      .populate("user", "name avatar")
      .populate("replies.user", "name avatar")
      .sort({ createdAt: -1 });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/reply/:commentId", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.commentId);
    comment.replies.push({ user: req.user.id, text });
    await comment.save();
    const populated = await comment.populate("replies.user", "name avatar");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
