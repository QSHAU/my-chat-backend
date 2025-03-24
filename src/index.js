import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { initSocket } from "./config/socket.js";
import cors from "cors";
import db from "./config/db.js";


import userRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);
initSocket(server);

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", async (req, res) => {
  try {
    await db.raw("SELECT 1");
    res.send("Success connection");
  } catch (error) {
    res.status(500).send("Database connection error");
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});