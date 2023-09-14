const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const shortUUID = require("short-uuid");

const GCP_SERVICE_ACCOUNT_KEY_PATH = process.env.GCP_SERVICE_ACCOUNT_KEY_PATH;
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_BUCKET_NAME = process.env.GCP_BUCKET_NAME;

const router = express.Router();

const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  keyFilename: GCP_SERVICE_ACCOUNT_KEY_PATH,
});
const bucketName = GCP_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Optional: limit to 50MB
  },
});

router.post("/upload", multerMid.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const translator = shortUUID();
    const uuid = translator.new();

    const filenameParts = req.file.originalname.split(".");
    const newFilename = `${filenameParts[0]}-${uuid}.${
      filenameParts[1] || "png"
    }`; // defaulting to png if no extension is found

    const blob = bucket.file(newFilename);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      res.status(500).send(err);
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send(publicUrl);
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
module.exports = router;
