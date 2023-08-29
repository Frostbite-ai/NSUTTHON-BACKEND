// const crypto = require("crypto");
// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const knex = require("../utils/db.js"); // Import the knex instance you've set up
// const JWT_SECRET = process.env.JWT_SECRET || "your_development_secret";

// router.post("/forgot-password", async (req, res, next) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       throw new Error("Email is required");
//     }

//     const user = await knex("users").select("*").where("email", email).first();

//     if (!user) {
//       throw new Error("No user with that email address found.");
//     }

//     const resetToken = crypto.randomBytes(20).toString("hex");
//     const resetExpiration = Date.now() + 3600000; // 1 hour from now

//     // Store token and its expiration in the database
//     await knex("users").where("user_id", user.user_id).update({
//       reset_password_token: resetToken,
//       reset_password_expires: resetExpiration,
//     });

//     // TODO: Send the token to user's email
//     // You will have to integrate with an email service like SendGrid, Nodemailer, etc.

//     res.send("Password reset email sent!");
//   } catch (err) {
//     next(err);
//   }
// });

// router.post("/reset-password", async (req, res, next) => {
//   try {
//     const { token, newPassword } = req.body;

//     if (!token || !newPassword) {
//       throw new Error("Token and new password are required.");
//     }

//     const user = await knex("users")
//       .select("*")
//       .where("reset_password_token", token)
//       .andWhere("reset_password_expires", ">", Date.now())
//       .first();

//     if (!user) {
//       throw new Error("Invalid or expired token.");
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await knex("users").where("user_id", user.user_id).update({
//       password: hashedPassword,
//       reset_password_token: null,
//       reset_password_expires: null,
//     });

//     res.send("Password updated successfully!");
//   } catch (err) {
//     next(err);
//   }
// });

// // Error handling middleware
// router.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send({ error: err.message });
// });

// module.exports = router;
