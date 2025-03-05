export async function up(knex) {
	return knex.schema.hasTable('tokens').then((exists) => {
		if (!exists) {
			return knex.schema.createTable('tokens', (table) => {
				table.increments('id').primary();
				table.integer('user_id').unsigned();
				table.foreign('user_id').references('users.id');
				table.text('access_token').notNullable();
				table.text('refresh_token').notNullable();
				table.text('ua');
				table.timestamp('date_added').defaultTo(knex.fn.now());
				table.timestamp('date_modified').defaultTo(knex.fn.now());
			});
		}
	});
}

export async function down(knex) {
	return knex.schema.dropTableIfExists('tokens');
}