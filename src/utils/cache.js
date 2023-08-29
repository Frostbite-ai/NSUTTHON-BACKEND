// cache.js
const NodeCache = require("node-cache");
const teamsCache = new NodeCache();
const eventsCache = new NodeCache();
module.exports = { teamsCache, eventsCache };
