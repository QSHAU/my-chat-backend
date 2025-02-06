import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";
import userRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/auth", userRoutes);

app.get("/", async (req, res) => {
  try {
    await db.raw("SELECT 1");
    res.send("Success connection");
  } catch (error) {
    res.status(500).send("Database connection error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});