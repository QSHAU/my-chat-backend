import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import db from "./config/db.js";


import userRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Настрой в зависимости от фронта
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", async (req, res) => {
  try {
    await db.raw("SELECT 1");
    res.send("Success connection");
  } catch (error) {
    res.status(500).send("Database connection error");
  }
});

io.on('connection', (socket) => {
    console.log("User connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        
    });
    
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});