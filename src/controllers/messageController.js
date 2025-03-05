import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { io } from "../config/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { chat_id, sender_id, content } = req.body;
        
        if (!chat_id || !content) {
            return res.status(400).json({ error: "Все поля обязательны" });
        }

        const chat = await Chat.query().findById(chat_id);
        if (!chat) {
            return res.status(404).json({ error: "Чат не найден" });
        }

        const message = await Message.query().insert({
            chat_id,
            sender_id,
            content,
        });
        
        io.to(`chat_${chat_id}`).emit("newMessage", message);

        return res.status(201).json(message);
    } catch (error) {
        return res.status(500).json({ error: "Ошибка при отправке сообщения" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const messages = await Message.query()
            .where("chat_id", chatId)
            .withGraphFetched("sender(selectSafe)")
            .modifiers({
                selectSafe(builder) {
                  builder.select('users.id', 'users.username'); // возвращать только безопасные поля
                }
              })

        return res.json(messages);
    } catch (error) {
        return res
            .status(500)
            .json({ error: "Ошибка при получении сообщений" });
    }
};
