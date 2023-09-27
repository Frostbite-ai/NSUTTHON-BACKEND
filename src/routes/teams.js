const express = require("express");
const router = express.Router();
const knex = require("../utils/db.js");
const ExcelJS = require("exceljs");
const authenticateToken = require("../middlewares/authenticateToken.js");

const { teamsCache } = require("../utils/cache.js");

// 1. Get all of the team names, team id, and points from the team table.
router.get("/teams", async (req, res) => {
  try {
    let allTeams = teamsCache.get("allTeams");

    if (!allTeams) {
      console.log("Before database call");
      allTeams = await knex("Team").select("team_id", "team_name", "points");
      console.log("After database call");
      console.log("Data fetched from DB:", allTeams);
      teamsCache.set("allTeams", allTeams, 3600); // Cache for 1 hour
    }
    res.json(allTeams);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching teams.");
  }
});

// 2. Update points based on the team ID.
router.put("/teams/update-points", authenticateToken, async (req, res) => {
  const { team_id, points } = req.body;

  // Validate request parameters
  if (!team_id || points == null) {
    return res
      .status(400)
      .json({ message: "Team ID and points are required." });
  }

  try {
    // Check if team exists
    const teamExists = await knex("Team").where("team_id", team_id).first();
    if (!teamExists) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Update points
    await knex("Team").where("team_id", team_id).update({ points });

    // Invalidate cache as data is changed
    teamsCache.del("allTeams");

    res.status(200).json({ message: "Team points updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error while updating points.",
      error: err.message,
    });
  }
});

router.get("/refreshTeams", async (req, res) => {
  try {
    const allTeams = await knex("Team").select(
      "team_id",
      "team_name",
      "points"
    );
    teamsCache.set("allTeams", allTeams, 3600);
    res.json(allTeams);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while refreshing teams.");
  }
});

// 3. Get team members' details based on team ID.
router.get("/team-members/:team_id", async (req, res) => {
  const team_id = req.params.team_id;
  try {
    const cacheKey = `teamMembers-${team_id}`;
    let teamMembers = teamsCache.get(cacheKey);

    if (!teamMembers) {
      teamMembers = await knex("Team_members")
        .where("team_id", team_id)
        .select("*");
      teamsCache.set(cacheKey, teamMembers, 3600); // Cache for 1 hour
    }
    res.json(teamMembers);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching team members.");
  }
});

router.get("/teams/export", async (req, res) => {
  try {
    const teams = await knex("Team").select("team_id", "team_name", "points");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Teams");

    worksheet.columns = [
      { header: "Team ID", key: "team_id", width: 10 },
      { header: "Team Name", key: "team_name", width: 25 },
      { header: "Points", key: "points", width: 10 },
      { header: "Member Name", key: "member_name", width: 25 },
      { header: "Branch", key: "branch", width: 25 },
      { header: "Phone Number", key: "phone_number", width: 20 },
      { header: "Roll No", key: "roll_no", width: 20 },
      { header: "Email", key: "email", width: 25 },
    ];

    for (const team of teams) {
      const teamMembers = await knex("Team_members")
        .where("team_id", team.team_id)
        .select("member_name", "branch", "phone_number", "roll_no", "email");

      if (teamMembers.length === 0) {
        worksheet.addRow({
          ...team,
          member_name: "",
          branch: "",
          phone_number: "",
          roll_no: "",
          email: "",
        });
      } else {
        for (const member of teamMembers) {
          worksheet.addRow({
            ...team,
            ...member,
          });
        }
      }
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=teams.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while exporting teams to Excel.");
  }
});

module.exports = router;

module.exports = router;
