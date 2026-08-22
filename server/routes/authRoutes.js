const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// AUTH ROUTES
// ==========================================

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);


// ==========================================
// CURRENT USER
// ==========================================

router.get(
  "/me",
  protect,
  getMe
);


module.exports = router;