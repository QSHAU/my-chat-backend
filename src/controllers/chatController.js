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

        const existingChat = await Chat.query()
            .join("chat_users as cu1", "chats.id", "cu1.chat_id")
            .join("chat_users as cu2", "chats.id", "cu2.chat_id")
            .where("cu1.user_id", userId)
            .where("cu2.user_id", recipientId)
            .first();

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        const chat = await Chat.query().insert({});

        await chat.$relatedQuery("users").relate(userId);
        await chat.$relatedQuery("users").relate(recipientId);

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
                            "messages.is_read",
                            "messages.media_url"
                        )
                        .orderBy("messages.created_at", "desc")
                        .limit(1);
                },
            })
            .orderByRaw(
                "COALESCE((SELECT m.created_at FROM messages m WHERE m.chat_id = chats.id ORDER BY m.created_at DESC LIMIT 1), chats.created_at) DESC"
            );

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
        const currentUserId = req.user.id;

        const chat = await Chat.query()
            .findById(chatId)
            .withGraphFetched("users(selectSafe)")
            .modifiers({
                selectSafe(builder) {
                    builder.select("users.id", "users.username");
                },
            });
        if (!chat) {
            return res.status(404).json({ error: "Чат не найден" });
        }

        const interlocutor = chat.users.find(
            (user) => user.id !== currentUserId
        );

        return res.json({
            chatId: chat.id,
            type: chat.type,
            created_at: chat.created_at,
            interlocutor: interlocutor || null,
        });
    } catch (error) {
        console.error("Ошибка при получении деталей чата:", error);
        return res
            .status(500)
            .json({ error: "Ошибка при получении деталей чата" });
    }
};
