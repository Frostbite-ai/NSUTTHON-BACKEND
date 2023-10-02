const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors"); // <-- Import the cors middleware

const app = express();
const port = process.env.PORT || 3000;

// Use the cors middleware
app.use(cors());

app.use(express.json());

const authRoutes = require("./routes/auth"); // Assuming the `/login` and `/signup` are in `auth.js`
const authenticateToken = require("./middlewares/authenticateToken");
// const passwordResetRoutes = require("./routes/passwordReset");
const homepage = require("./routes/home");
const events = require("./routes/events");
const register = require("./routes/teamregister");
const team = require("./routes/teams");
const fileUploadRoutes = require("./routes/fileupload");

// Use the connection string from Railway's dashboard
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || "your_development_secret";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Mount your routes
app.use("/", authRoutes);
app.use("/", events);
app.use("/", register);
app.use("/", team);
app.use("/", fileUploadRoutes);
app.use("/", homepage);
// app.use("/", homepage);

// Example of using the authenticateToken middleware for another route
// app.use("/profile", authenticateToken, profileRoutes);

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
