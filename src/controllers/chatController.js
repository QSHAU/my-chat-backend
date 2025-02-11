import Chat from "../models/Chat.js";

export const createChat = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId обязателен" });
    
        const chat = await Chat.query().insert({});
    
        await chat.$relatedQuery("users").relate(userId);
    
        return res.status(201).json(chat);
      } catch (error) {
        return res.status(500).json({ error: "Ошибка при создании чата" });
      }
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.query();
    return res.json(chats);
  } catch (error) {
    return res.status(500).json({ error: "Ошибка при получении чатов" });
  }
};

export const getUserChats = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const chats = await Chat.query()
        .joinRelated("users")
        .where("users.id", userId);
  
      return res.json(chats);
    } catch (error) {
      return res.status(500).json({ error: "Ошибка при получении чатов" });
    }
};