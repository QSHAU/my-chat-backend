import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { create, login, refresh, logout, isAuth, searchUser } from "../controllers/usersController.js";

const router = express.Router();

router.post("/register", create);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/search", authMiddleware, searchUser);

router.get("/isAuth", authMiddleware, isAuth);

export default router;