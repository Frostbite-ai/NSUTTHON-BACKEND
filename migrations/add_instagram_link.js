// e.g. YYYYMMDDHHMMSS_add_instagram_link_to_events.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("events", (table) => {
    table.string("instagram_link", 512); // Adding Instagram link column here
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("events", (table) => {
    table.dropColumn("instagram_link"); // Dropping Instagram link column here
  });
};
