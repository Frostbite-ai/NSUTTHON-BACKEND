/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("user_id").primary();
      table.string("mobile_number", 15).unique().notNullable();
      table.string("password", 255).notNullable();
      table.string("name", 255);
      table.string("email", 255);
      table.string("roll_no", 50);
      table.string("branch", 100);
      table.boolean("is_verified").defaultTo(false);
    })
    .createTable("teams", (table) => {
      table.increments("team_id").primary();
      table.string("team_name", 255).notNullable();
      table.integer("team_leader_id").references("user_id").inTable("users");
    })
    .createTable("team_members", (table) => {
      table.increments("team_member_id").primary();
      table.integer("team_id").references("team_id").inTable("teams");
      table.integer("user_id").references("user_id").inTable("users");
    })
    .createTable("societies", (table) => {
      table.increments("society_id").primary();
      table.string("society_name", 255).notNullable();
      table.string("contact_info", 255);
    })
    .createTable("event_tags", (table) => {
      table.increments("tag_id").primary();
      table.string("tag_name", 255).unique().notNullable();
    })
    .createTable("events", (table) => {
      table.increments("event_id").primary();
      table.string("event_name", 255).notNullable();
      table.text("description");
      table.text("rules");
      table.date("date");
      table.time("time");
      table.string("venue", 255);
      table.integer("society_id").references("society_id").inTable("societies");
    })
    .createTable("event_event_tags", (table) => {
      table.integer("event_id").references("event_id").inTable("events");
      table.integer("tag_id").references("tag_id").inTable("event_tags");
      table.primary(["event_id", "tag_id"]);
    })
    .createTable("event_registrations", (table) => {
      table.increments("registration_id").primary();
      table.integer("event_id").references("event_id").inTable("events");
      table.integer("team_id").references("team_id").inTable("teams");
    })
    .createTable("leaderboard", (table) => {
      table.increments("entry_id").primary();
      table.integer("team_id").references("team_id").inTable("teams");
      table.integer("total_points").defaultTo(0);
    })
    .createTable("points_history", (table) => {
      table.increments("history_id").primary();
      table.integer("team_id").references("team_id").inTable("teams");
      table.integer("event_id").references("event_id").inTable("events");
      table.integer("points_awarded");
      table.date("date_awarded").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable("points_history")
    .dropTable("leaderboard")
    .dropTable("event_registrations")
    .dropTable("event_event_tags")
    .dropTable("events")
    .dropTable("event_tags")
    .dropTable("societies")
    .dropTable("team_members")
    .dropTable("teams")
    .dropTable("users");
};
