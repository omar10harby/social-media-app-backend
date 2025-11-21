import express from "express";
import Post from "../models/Posts.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import cloudinary from "../uitls/cloudinary.js";
const router = express.Router();
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { image, text } = req.body;

    const newPost = new Post({
      user: req.user?.id,
      text,
      image,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async(req,res)=> {
    try {
        const posts = await Post.find()
        .populate("user","name email avatar")
        .populate("likes")
        .sort({ createdAt: -1 });

         res.json(posts);

    } catch (error) {
         res.status(500).json({ error: error.message });     
    }
})

router.put("/:id", authMiddleware, async(req,res)=> {
    try {
        const post = await Post.findById(req.params.id)
        if(post.user.toString() !== req.user.id){
            return res.status(403).json({error:"Not Authorized"})

        }

        post.text = req.body.text ||  post.text
        post.image = req.body.image ||  post.image
        await post.save();

        res.json(post);

    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.delete("/:postId", authMiddleware, async(req,res)=> {
    try {
        const post = await Post.findById(req.params.postId) 

        if(post.user.toString() !== req.user.id){
            return res.status(403).json({error:"Not Authorized"})

        }

        await post.deleteOne()
        res.json({message:"Post Deleted Successfully"})

    } catch (error) {
       res.status(500).json({error:error.message}) 
    }
})

router.get("/by-user/:userId", async(req,res)=> {
    try {
       const posts = await Post.find({user:req.params.userId}) 
       .populate("user" , "name email avatar")
        .sort({ createdAt: -1 });
        res.json(posts)
    } catch (error) {
          res.status(500).json({ error: error.message });
    }
})
export default router;
