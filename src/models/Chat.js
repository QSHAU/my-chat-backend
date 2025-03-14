import { Model } from "objection";
import db from "../config/db.js";
import User from "./User.js";
import Message from "./Message.js";

class Chat extends Model {
    static get tableName() {
        return "chats";
    }

    static get relationMappings() {
        return {
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: "chats.id",
                    through: {
                        from: "chat_users.chat_id",
                        to: "chat_users.user_id",
                    },
                    to: "users.id",
                },
            },

            lastMessage: {
                relation: Model.HasOneRelation,
                modelClass: Message,
                join: {
                    from: "chats.id",
                    to: "messages.chat_id",
                },
                modify: (query) => {
                    query.orderBy("created_at", "desc").limit(1);
                },
            },
        };
    }
}

Chat.knex(db);
export default Chat;
