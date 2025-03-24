export const up = function(knex) {
    return knex.schema.alterTable("messages", (table) => {
      table.boolean("edited").defaultTo(false);
    });
};

export const down = function(knex) {
    return knex.schema.alterTable("messages", (table) => {
        table.dropColumn("edited");
    });
};