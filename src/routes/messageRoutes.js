import express from "express";
import { sendMessage, getMessages, markMessagesAsRead, editMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/:chatId", getMessages);
router.post("/read", markMessagesAsRead);
router.put("/:id", editMessage)

export default router;
