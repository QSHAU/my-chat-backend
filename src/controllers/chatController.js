import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const createChat = async (req, res) => {
    try {
        const { userId, recipientId } = req.body;
        if (!userId || !recipientId) {
            return res
                .status(400)
                .json({ error: "userId и recipientId обязательны" });
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

        // Получаем все чаты, в которых участвует пользователь, вместе с участниками и последним сообщением
        const chats = await Chat.query()
            .select("chats.id", "chats.type", "chats.created_at")
            .join("chat_users as cu", "chats.id", "cu.chat_id")
            .where("cu.user_id", userId)
            .withGraphFetched(
                "[users(selectUserFields), lastMessage(selectLastMessage)]"
            )
            .modifiers({
                selectUserFields: (builder) => {
                    builder.select("users.id", "users.username");
                },
                selectLastMessage: (builder) => {
                    builder
                        .select(
                            "messages.id",
                            "messages.content",
                            "messages.sender_id",
                            "messages.created_at",
                            "messages.is_read"
                        )
                        .orderBy("messages.created_at", "desc")
                        .limit(1);
                },
            });

        // Добавляем для каждого чата количество непрочитанных сообщений (исключая отправленные самим пользователем)
        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const unread = await Message.query()
                  .where("chat_id", chat.id)
                  .whereNot("sender_id", userId)
                  .where("is_read", false)
                  .count({ unreadCount: "*" })
                  .first();

                const unreadCount = unread ? parseInt(unread.unreadCount, 10) : 0;
                
                return {
                    ...chat,
                    unread_count: unreadCount,
                };
            })
        );

        return res.json(chatsWithUnread);
    } catch (error) {
        console.error("Ошибка при получении чатов:", error);
        return res
            .status(500)
            .json({
                error: "Ошибка при получении чатов",
                details: error.message,
            });
    }
};

export const getChatDetails = async (req, res) => {
    try {
        const { chatId } = req.params;
        const currentUserId = req.user.id; // authMiddleware должен добавить этот id

        // Получаем чат вместе с участниками
        const chat = await Chat.query()
            .findById(chatId)
            .withGraphFetched("users(selectSafe)")
            .modifiers({
                selectSafe(builder) {
                    builder.select("users.id", "users.username"); // возвращать только безопасные поля
                },
            });
        if (!chat) {
            return res.status(404).json({ error: "Чат не найден" });
        }

        // Находим собеседника: фильтруем участников, исключая текущего пользователя
        const interlocutor = chat.users.find(
            (user) => user.id !== currentUserId
        );

        return res.json({
            chatId: chat.id,
            type: chat.type,
            created_at: chat.created_at,
            interlocutor: interlocutor || null, // если собеседника не найдено
        });
    } catch (error) {
        console.error("Ошибка при получении деталей чата:", error);
        return res
            .status(500)
            .json({ error: "Ошибка при получении деталей чата" });
    }
};
