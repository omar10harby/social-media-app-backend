import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: "User Registered Successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Email already used" });
    }

    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "user Not Found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "invalid Password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: "User logged in Successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({ message: "Logged out Successfully" });
});

router.get("/me/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "user not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "user not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/avatar", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;

    console.log("Avatar update - User ID:", id);
    console.log("Avatar update - New URL:", avatar);

    const user = await User.findByIdAndUpdate(id, { avatar }, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Avatar updated successfully for user:", user._id);
    res.json(user);
  } catch (error) {
    console.error("Avatar update error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
