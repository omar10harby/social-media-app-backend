import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Users from "./routes/Users.js";   // ← حسب اسم الملف
import Posts from "./routes/Posts.js"
import Comments from "./routes/Comments.js";
dotenv.config();

const app = express();
app.use(cors({
  origin:"http://localhost:5173"
}));
app.use(express.json()); // مهم جداً للـ body

app.use("/users", Users);
app.use("/posts",Posts)
app.use("'/comments",Comments)
mongoose
  .connect(process.env.MONGOO_URL) // ← صححها لو الاسم مختلف
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.log(err));
