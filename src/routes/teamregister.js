const express = require("express");
const router = express.Router();
const knex = require("../utils/db.js"); // Import the knex instance you've set up
// const NodeCache = require("node-cache");
// const teamsCache = new NodeCache();
// // cache.js
// const NodeCache = require("node-cache");
// const teamsCache = new NodeCache();
// module.exports = teamsCache;
const { teamsCache } = require("../utils/cache.js");

router.post("/register", (req, res) => {
  const { teamName, members } = req.body;

  if (!teamName || !members || members.length > 6) {
    return res.status(400).json({ error: "Invalid data provided" });
  }

  knex
    .transaction((trx) => {
      // Insert team and get the inserted team ID
      return trx("Team")
        .insert({
          team_name: teamName,
        })
        .returning("team_id")
        .then(([returnedData]) => {
          const teamId = returnedData.team_id;

          // Create members' data with the team ID
          const teamMembers = members.map((member) => ({
            team_id: teamId,
            member_name: member.name,
            branch: member.branch,
            phone_number: member.phone,
            email: member.email,
            roll_no: member.rollno,
          }));

          // Insert members and get their IDs
          return trx("Team_members")
            .insert(teamMembers)
            .returning("team_member_id")
            .then((insertedMembers) => {
              return {
                teamId,
                insertedMembers: insertedMembers,
              };
            });
        })
        .then(({ teamId, insertedMembers }) => {
          // Update the team_leader_id
          return trx("Team").where("team_id", teamId).update({
            team_leader_id: insertedMembers[0].team_member_id,
          });
        });
    })
    .then(() => {
      // Invalidate the cache for allTeams because a new team has been registered
      console.log("Cache before invalidation:", teamsCache.get("allTeams"));
      teamsCache.del("allTeams");
      console.log("Cache after invalidation:", teamsCache.get("allTeams"));
      res.status(201).json({ message: "Registration successful!" });
    })
    .catch((error) => {
      teamsCache.del("allTeams");
      console.error("Detailed Error:", error);
      res.status(500).json({ error: "Error registering team", details: error });
    });
});

module.exports = router;
