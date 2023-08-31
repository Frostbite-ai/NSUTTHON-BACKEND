const express = require("express");
const router = express.Router();
const knex = require("../utils/db.js");
const nodemailer = require("nodemailer");
const { teamsCache } = require("../utils/cache.js");
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

console.log("SMTP Configuration:");
console.log("Host:", SMTP_HOST);
console.log("Port:", SMTP_PORT);
console.log("Email:", SMTP_EMAIL);
console.log(
  "Password:",
  SMTP_PASSWORD && SMTP_PASSWORD.startsWith("*") ? "********" : SMTP_PASSWORD
); // Optional: Obfuscate if you wish

// SMTP configuration
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, // true for 465 (SSL), false for other ports
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

// // Send Test Email Function
// const sendTestEmail = () => {
//   const mailOptions = {
//     from: `"Your Name or Organization" <${SMTP_EMAIL}>`,
//     to: SMTP_EMAIL, // sending test email to the SMTP_EMAIL
//     subject: "Test Email",
//     text: `This is a test email to check SMTP configuration.`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log("Error sending test mail:", error);
//     } else {
//       console.log("Test email sent:", info.response);
//     }
//   });
// };

// // Call the function to send the test email when the server starts
// sendTestEmail();

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
      teamsCache.del("allTeams");

      // Send email to all team members
      members.forEach((member) => {
        console.log(`Preparing to send email to ${member.email}...`);
        const mailOptions = {
          from: `"Team Crosslinks" <${SMTP_EMAIL}>`,
          to: member.email,
          subject: "Registration Successful ",
          // text: `This is a test email to check SMTP configuration.`, // You can keep this as a fallback
          html: `
      <h1>This is a test email</h1>
      <p>This is to check <strong>SMTP</strong> configuration and HTML rendering.</p>
      <a href="https://www.example.com">Visit our website</a>
    `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(`Error sending mail to ${member.email}:`, error);
          } else {
            console.log(
              `Email successfully sent to ${member.email}. Response:`,
              info.response
            );
          }
        });
      });

      console.log("Sending response to client: Registration successful!");
      res.status(201).json({ message: "Registration successful!" });
    })
    .catch((error) => {
      console.log("Encountered an error while registering team:", error);
      teamsCache.del("allTeams");
      console.error("Detailed Error:", error);
      res.status(500).json({ error: "Error registering team", details: error });
    });
});

module.exports = router;
