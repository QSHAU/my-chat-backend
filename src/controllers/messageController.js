import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { io } from "../config/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { chat_id, sender_id, content, media_url } = req.body;

        if (!chat_id || (!content && !media_url)) {
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
            media_url,
            created_at: new Date(),
        });
    
        io.to(`chat_${chat_id}`).emit("newMessage", message);

        return res.status(201).json(message);
    } catch (error) {
        return res.status(500).json({ error: "Ошибка при отправке сообщения", details: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        let messages = await Message.query()
            .where("chat_id", chatId)
            .orderBy("created_at", "desc")
            .limit(Number(limit))
            .offset(Number(offset))
            .withGraphFetched("sender(selectSafe)")
            .modifiers({
                selectSafe(builder) {
                  builder.select('users.id', 'users.username');
                }
              })

        messages = messages.reverse();

        return res.json(messages);
    } catch (error) {
        return res
            .status(500)
            .json({ error: "Ошибка при получении сообщений" });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
      const { chatId, userId } = req.body;
  
      await Message.query()
        .where("chat_id", chatId)
        .whereNot("sender_id", userId)
        .update({ is_read: true });
        
      return res.status(200).json({ message: "Сообщения помечены как прочитанные" });
    } catch (error) {
      return res.status(500).json({ error: "Ошибка при обновлении статуса сообщений", details: error.message });
    }
  };

  export const editMessage = async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
  
      if (!content) {
        return res.status(400).json({ error: "Новый текст сообщения обязателен" });
      }
  
      const updatedMessage = await Message.query()
        .patchAndFetchById(id, {
          content,
          edited: true,
        });
  
      io.to(`chat_${updatedMessage.chat_id}`).emit("messageEdited", updatedMessage);
  
      return res.json(updatedMessage);
    } catch (error) {
      console.error("Ошибка при редактировании сообщения:", error);
      return res.status(500).json({ error: "Ошибка при редактировании сообщения" });
    }
  };