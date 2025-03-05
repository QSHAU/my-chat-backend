export const up = function(knex) {
  return knex.schema.createTable("chats", (table) => {
      table.increments("id").primary();
      table.string("type").notNullable().defaultTo("private");
      table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

export const down = function(knex) {
  return knex.schema.dropTable("chats");
};