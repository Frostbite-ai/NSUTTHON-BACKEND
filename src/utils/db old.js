const { Pool } = require("pg");
require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

// Set up the PostgreSQL pool using the connection string from your .env file old
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/initdb", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query(`
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    roll_no VARCHAR(50),
    branch VARCHAR(100),
    is_verified BOOLEAN DEFAULT false
);

CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    team_leader_id INTEGER REFERENCES users(user_id)
);

CREATE TABLE team_members (
    team_member_id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(team_id),
    user_id INTEGER REFERENCES users(user_id)
);

CREATE TABLE societies (
    society_id SERIAL PRIMARY KEY,
    society_name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255)
);

CREATE TABLE event_tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    rules TEXT,
    date DATE,
    time TIME,
    venue VARCHAR(255),
    society_id INTEGER REFERENCES societies(society_id)
);

CREATE TABLE event_event_tags (
    event_id INTEGER REFERENCES events(event_id),
    tag_id INTEGER REFERENCES event_tags(tag_id),
    PRIMARY KEY (event_id, tag_id)
);

CREATE TABLE event_registrations (
    registration_id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(event_id),
    team_id INTEGER REFERENCES teams(team_id)
);

CREATE TABLE leaderboard (
    entry_id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(team_id),
    total_points INTEGER DEFAULT 0
);

CREATE TABLE points_history (
    history_id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(team_id),
    event_id INTEGER REFERENCES events(event_id),
    points_awarded INTEGER,
    date_awarded DATE DEFAULT CURRENT_DATE
);

    `);

    client.release();
    res.send("Tables created successfully");
  } catch (err) {
    console.error(err);
    res.send("Error creating tables");
  }
});

// Export the pool and initializeDB function so you can use them elsewhere in your app
module.exports = {
  pool,
};
