const express = require("express");

const router = express.Router();

const {
  evaluateInterviewAnswer,
  saveInterview,
  getInterviewHistory,
  getInterviewById,
} = require("../controllers/interviewController");

const protect = require("../middleware/authMiddleware");

// ==========================================
// AI EVALUATION
// ==========================================

router.post(
  "/evaluate",
  protect,
  evaluateInterviewAnswer
);

// ==========================================
// SAVE COMPLETED INTERVIEW
// ==========================================

router.post(
  "/save",
  protect,
  saveInterview
);

// ==========================================
// GET INTERVIEW HISTORY
// ==========================================

router.get(
  "/history",
  protect,
  getInterviewHistory
);

// ==========================================
// GET SINGLE INTERVIEW DETAILS
// ==========================================

router.get(
  "/history/:id",
  protect,
  getInterviewById
);

module.exports = router;