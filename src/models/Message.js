import { Model } from "objection";
import db from "../config/db.js";
import User from "./User.js";
import Chat from "./Chat.js";

class Message extends Model {
    static get tableName() {
        return "messages";
    }

    static get relationMappings() {
        return {
            sender: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: "messages.sender_id",
                    to: "users.id",
                },
            },
            chat: {
                relation: Model.BelongsToOneRelation,
                modelClass: Chat,
                join: {
                    from: "messages.chat_id",
                    to: "chats.id",
                },
            },
        };
    }

    $formatJson(json) {
        json = super.$formatJson(json);
        json.created_at = this.created_at;
        return json;
    }
}

Message.knex(db);
export default Message;
