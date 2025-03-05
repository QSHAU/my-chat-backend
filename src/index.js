import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./config/socket.js";
import cors from "cors";
import db from "./config/db.js";


import userRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = initSocket(server);

app.use(cors({
  origin: "*",
  credentials: true,
}));

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

io.on("connection", (socket) => {
  console.log(`🟢 Пользователь подключился: ${socket.id}`);

  // Пользователь присоединяется к комнате чата
  socket.on("joinChat", (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`👤 Пользователь ${socket.id} зашел в чат ${chatId}`);
  });

  // Получаем и отправляем сообщения
  socket.on("sendMessage", async (data) => {
      const { chatId, senderId, content } = data;

      // Сохраняем сообщение в БД
      const message = await db("messages").insert({
          chat_id: chatId,
          sender_id: senderId,
          content,
      }).returning("*");

      // Отправляем сообщение всем в чате
      io.to(`chat_${chatId}`).emit("newMessage", message[0]);
      console.log(`📩 Сообщение отправлено в чат ${chatId}`);
  });

  // Отключение пользователя
  socket.on("disconnect", () => {
      console.log(`🔴 Пользователь отключился: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});