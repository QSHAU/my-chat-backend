import express from "express";
import { create } from "../controllers/users.js";

const router = express.Router();

// Регистрация нового пользователя
router.post("/register", create); // Используем register как обработчик маршрута

export default router;