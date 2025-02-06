import { Model } from "objection";

class User extends Model {
  static get tableName() {
    return "users";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "email", "password"],
      properties: {
        id: { type: "integer" },
        username: { type: "string", minLength: 3, maxLength: 255 },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 },
        created_at: { type: "string", format: "date-time" },
      },
    };
  }
}

export default User