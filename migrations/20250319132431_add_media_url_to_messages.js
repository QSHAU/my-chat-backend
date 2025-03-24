export const up = function (knex) {
    return knex.schema.alterTable("messages", (table) => {
        table.string("media_url").nullable();
    });
};

export const down = function (knex) {
    return knex.schema.alterTable("messages", (table) => {
        table.dropColumn("media_url");
    });
};
