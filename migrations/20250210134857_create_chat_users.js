export const up = function (knex) {
    return knex.schema.createTable("chat_users", (table) => {
        table.increments("id").primary();
        table
            .integer("chat_id")
            .unsigned()
            .references("id")
            .inTable("chats")
            .onDelete("CASCADE");
        table
            .integer("user_id")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        table
            .integer("recipientId")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        table.unique(["chat_id", "user_id", "recipientId"]); // Уникальная пара chat_id + user_id
    });
};

export const down = function (knex) {
    return knex.schema.dropTable("chat_users");
};
