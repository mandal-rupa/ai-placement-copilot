const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const protect = require("../middleware/authMiddleware");

const {
  analyzeResume,
  getLatestResume,
} = require("../controllers/resumeController");

const router = express.Router();

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const uploadDir = "/tmp/uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// ==========================================
// ANALYZE RESUME
// ==========================================

router.post("/analyze", protect, upload.single("resume"), analyzeResume);

// ==========================================
// GET LATEST RESUME
// ==========================================

router.get("/latest", protect, getLatestResume);

module.exports = router;
