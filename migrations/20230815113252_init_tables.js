/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("events", (table) => {
      table.increments("event_id").primary();
      table.string("event_name", 255).notNullable();
      table.text("description");
      table.text("rules");
      table.integer("day_number").notNullable();
      table.time("time");
      table.string("venue", 255);
      table.string("society_name");
      table.string("name_poc_1", 255);
      table.string("phone_poc_1", 15);
      table.string("name_poc_2", 255);
      table.string("phone_poc_2", 15);
      table.string("name_poc_3", 255);
      table.string("phone_poc_3", 15);
      table
        .string("banner_url_1", 512)
        .defaultTo(
          "https://nsutthon.s3.ap-south-1.amazonaws.com/PLACEHOLDER.jpg"
        );
      table.string("banner_url_2", 512);
      table.string("banner_url_3", 512);
      table.string("registration_link", 512);
    })
    .then(() => {
      return knex.schema.createTable("Team", (table) => {
        table.increments("team_id").primary();
        table.string("team_name", 255).notNullable().index();
        table.integer("points").defaultTo(0);
        table.integer("team_leader_id").nullable();
      });
    })
    .then(() => {
      return knex.raw('ALTER SEQUENCE "Team_team_id_seq" RESTART WITH 1001');
    })
    .then(() => {
      return knex.schema.createTable("Team_members", (table) => {
        table.increments("team_member_id").primary();
        table.integer("team_id").references("team_id").inTable("Team");
        table.string("member_name", 255).notNullable();
        table.string("branch", 255);
        table.string("phone_number", 15);
        table.string("roll_no", 50);
        // just added
        table.string("email", 255).notNullable();
      });
    })
    .then(() => {
      // New table: user
      return knex.schema.createTable("user", (table) => {
        table.increments("user_id").primary();
        table.string("username", 255).notNullable().unique();
        table.string("password", 255).notNullable();
      });
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("user")
    .dropTableIfExists("Team_members")
    .dropTableIfExists("Team")
    .dropTableIfExists("events");
};
