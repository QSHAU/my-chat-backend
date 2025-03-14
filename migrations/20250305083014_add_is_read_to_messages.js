export const up = function (knex) {
    return knex.schema.alterTable("messages", (table) => {
      table.boolean("is_read").defaultTo(false);
    });
  };
  
  export const down = function (knex) {
    return knex.schema.alterTable("messages", (table) => {
      table.dropColumn("is_read");
    });
  };
