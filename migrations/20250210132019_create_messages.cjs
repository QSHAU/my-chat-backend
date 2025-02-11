exports.up = function(knex) {
    return knex.schema.createTable("messages", (table) => {
        table.increments("id").primary();
        table.integer("chat_id").unsigned().references("id").inTable("chats").onDelete("CASCADE");
        table.integer("sender_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
        table.text("content").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("messages");
};