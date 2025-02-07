import express from "express";
import { create, login } from "../controllers/users.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", create);
router.post("/login", login);

router.get("/profile", authMiddleware, async (req, res) => {
    try {
      const user = await User.query().findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден!" });
      }
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
    console.error("Profile route error:", error);
      res.status(500).json({ message: "Ошибка сервера", error });
    }
  });

export default router;