const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/authRoutes");
const resumeRoutes = require("../routes/resumeRoutes");
const interviewRoutes = require("../routes/interviewRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AI Placement Copilot API is running 🚀",
  });
});

module.exports = app;