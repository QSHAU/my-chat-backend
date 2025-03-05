export const up = function(knex) {
    return knex.schema.alterTable("users", (table) => {
        table.text("refresh_token").nullable();
    });
};

export const down = function(knex) {
    return knex.schema.alterTable("users", (table) => {
        table.dropColumn("refresh_token");
    });
};
