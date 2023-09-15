/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("events", (table) => {
    table
      .string("banner_url_1_compressed", 512)
      .defaultTo("https://storage.googleapis.com/nsutthon/default_image.jpg");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("events", (table) => {
    table.dropColumn("banner_url_1_compressed");
  });
};
