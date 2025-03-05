import Chat from "../models/Chat.js";

export const createChat = async (req, res) => {
  try {
    const { userId, recipientId } = req.body;
    if (!userId || !recipientId) {
        return res.status(400).json({ error: "userId и recipientId обязательны" });
    }

    // Проверяем, существует ли уже чат между этими пользователями
    const existingChat = await Chat.query()
        .join("chat_users as cu1", "chats.id", "cu1.chat_id")
        .join("chat_users as cu2", "chats.id", "cu2.chat_id")
        .where("cu1.user_id", userId)
        .where("cu2.user_id", recipientId)
        .first();

    if (existingChat) {
        return res.status(200).json(existingChat);
    }

    // Если чата нет, создаём новый
    const chat = await Chat.query().insert({});

    // Привязываем пользователей к чату по очереди
    await chat.$relatedQuery("users").relate(userId);
    await chat.$relatedQuery("users").relate(recipientId);

    return res.status(201).json(chat);
  } catch (error) {
      console.error("Ошибка при создании чата:", error);
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
  
              // Получаем все чаты, в которых участвует пользователь
              const chats = await Chat.query()
              .join("chat_users", "chats.id", "chat_users.chat_id")
              .where("chat_users.user_id", userId)
              .select("chats.id", "chats.type", "chats.created_at");
  
          // Для каждого чата ищем второго участника (собеседника)
          const updatedChats = await Promise.all(chats.map(async (chat) => {
              const recipient = await Chat.relatedQuery("users")
                  .for(chat.id)
                  .whereNot("users.id", userId)
                  .select("users.id", "users.username")
                  .first();
  
              return {
                  ...chat,
                  recipient: recipient || null,
              };
          }));
  
          return res.json(updatedChats);
    } catch (error) {
      return res.status(500).json({ error: "Ошибка при получении чатов" });
    }
};

export const getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.id; // authMiddleware должен добавить этот id

    // Получаем чат вместе с участниками
    const chat = await Chat.query()
      .findById(chatId)
      .withGraphFetched('users(selectSafe)')
      .modifiers({
        selectSafe(builder) {
          builder.select('users.id', 'users.username'); // возвращать только безопасные поля
        }
      });
    if (!chat) {
      return res.status(404).json({ error: "Чат не найден" });
    }

    // Находим собеседника: фильтруем участников, исключая текущего пользователя
    const interlocutor = chat.users.find((user) => user.id !== currentUserId);

    return res.json({
      chatId: chat.id,
      type: chat.type,
      created_at: chat.created_at,
      interlocutor: interlocutor || null, // если собеседника не найдено
    });
  } catch (error) {
    console.error("Ошибка при получении деталей чата:", error);
    return res.status(500).json({ error: "Ошибка при получении деталей чата" });
  }
};