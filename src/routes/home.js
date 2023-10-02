const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.send("आप यहाँ आये किसलिए!🧐🥸");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
module.exports = router;
