import express from "express";
import { createChat, getChats, getUserChats  } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", createChat);
router.get("/", getChats);
router.get("/:userId", getUserChats);

export default router;
