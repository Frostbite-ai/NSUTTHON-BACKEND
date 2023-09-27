const express = require("express");
const router = express.Router();
const knex = require("../utils/db.js");
const authenticateToken = require("../middlewares/authenticateToken.js");
const { eventsCache } = require("../utils/cache.js");

require("dotenv").config();

router.get("/events", async (req, res) => {
  try {
    let allEvents = eventsCache.get("allEvents");
    if (!allEvents) {
      console.log("Before database call");
      allEvents = await knex("events").select("*");
      console.log("After database call");
      eventsCache.set("allEvents", allEvents, 3600); // Cache for 1 hour (3600 seconds)
    }
    res.json(allEvents);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching events.");
  }
});

router.get("/events/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    // First, try to get the event from cache.
    let event = eventsCache.get(`event-${eventId}`);

    if (!event) {
      console.log("Fetching event from database");
      event = await knex("events")
        .select("*")
        .where({ event_id: eventId })
        .first();

      if (!event) {
        return res.status(404).send("Event not found.");
      }

      // Cache the specific event for 1 hour.
      eventsCache.set(`event-${eventId}`, event, 3600);
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching the event.");
  }
});

router.post("/registerevent", authenticateToken, async (req, res) => {
  const {
    event_name,
    description,
    day_number,
    time,
    venue,
    society_name,
    pocs,
    registration_link,
    banner_url_1,
    banner_url_1_compressed,
    banner_url_2,
    banner_url_3,
  } = req.body;

  // Basic validation
  if (!event_name || !day_number || !time) {
    return res.status(400).send("Missing required fields.");
  }

  if (pocs.length > 3) {
    return res.status(400).send("A maximum of 3 POCs can be added.");
  }

  // Inserting data into the events table
  try {
    await knex("events").insert({
      event_name,
      description,
      day_number,
      time,
      venue,
      society_name,
      name_poc_1: pocs[0] ? pocs[0].name : null,
      phone_poc_1: pocs[0] ? pocs[0].phone : null,
      name_poc_2: pocs[1] ? pocs[1].name : null,
      phone_poc_2: pocs[1] ? pocs[1].phone : null,
      name_poc_3: pocs[2] ? pocs[2].name : null,
      phone_poc_3: pocs[2] ? pocs[2].phone : null,
      registration_link,
      banner_url_1,
      banner_url_1_compressed,
      banner_url_2,
      banner_url_3,
    });

    // Invalidate the cache after a new event is added
    eventsCache.del("allEvents");

    res.status(200).send("Event registered successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while registering event.");
  }
});

router.delete("/eventdelete/:id", authenticateToken, async (req, res) => {
  const eventId = req.params.id;

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  try {
    const eventExists = await knex("events")
      .where({ event_id: eventId })
      .first();

    if (!eventExists) {
      return res.status(404).json({ message: "Event not found." });
    }

    await knex("events").where({ event_id: eventId }).delete();

    eventsCache.del("allEvents"); // Invalidate the cache after an event is deleted

    res.status(200).json({ message: "Event deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error while deleting event.",
      error: err.message,
    });
  }
});

module.exports = router;
