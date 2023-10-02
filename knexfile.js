require("dotenv").config({ path: "./.env" });
console.log(process.env.DATABASE_URL);

module.exports = {
  development: {
    client: "pg",

    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Include this line for SSL configuration
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true }, // Set to true in production
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  // Add other environments like 'production', 'staging', etc. as needed
};
