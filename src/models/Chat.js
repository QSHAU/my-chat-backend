import { Model } from "objection";
import db from "../config/db.js";
import User from "./User.js";

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
    };
  }
}

Chat.knex(db);
export default Chat;