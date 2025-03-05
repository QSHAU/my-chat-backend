import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createChat, getChats, getUserChats, getChatDetails } from "../controllers/chatController.js";

const router = express.Router();

router.post("/create", createChat);
router.get("/", getChats);
router.get("/:userId", getUserChats);
router.get("/details/:chatId", authMiddleware, getChatDetails);

export default router;
