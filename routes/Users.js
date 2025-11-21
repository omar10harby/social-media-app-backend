import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "user registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "user not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message:"user login successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me/profile" , async(req,res)=> {

     try {
       const user = await User.findById(req.user.id).select("-password")  
       if(!user) return res.status(404).json({error:"user not found"})
        res.json(user)

    } catch (error) {
         res.status(500).json({ error: err.message });
    }
})

router.get("/:id" , async(req,res)=> {
    try {
       const user = await User.findById(req.params.id).select("-password")  
       if(!user) return res.status(404).json({error:"user not found"})
        res.json(user)

    } catch (error) {
         res.status(500).json({ error: err.message });
    }
})

export default router;
