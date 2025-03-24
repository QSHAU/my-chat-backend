import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("media"), (req, res) => {
  try {
    const filePath = req.file ? req.file.path : null;
    res.status(200).json({ filePath });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при загрузке файла" });
  }
});

export default router;