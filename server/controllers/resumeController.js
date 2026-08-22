const fs = require("fs");
const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");
const { semanticSimilarity } = require("../services/aiService");

const commonSkills = [
  "javascript",
  "typescript",
  "react",
  "node.js",
  "express",
  "mongodb",
  "mysql",
  "python",
  "java",
  "c++",
  "html",
  "css",
  "git",
  "github",
  "docker",
  "sql",
  "machine learning",
  "data analysis",
  "pandas",
  "numpy",
  "tensorflow",
  "communication",
  "problem solving",
  "dsa",
];

const skillDescriptions = {
  javascript: "JavaScript programming language and modern web development",

  typescript: "TypeScript strongly typed JavaScript programming",

  react: "React frontend development and component based user interfaces",

  "node.js": "Node.js backend server development",

  express: "Express.js backend REST API development",

  mongodb: "MongoDB NoSQL database development",

  mysql: "MySQL relational database development",

  python: "Python programming and software development",

  java: "Java programming and object oriented development",

  "c++": "C++ programming and data structures",

  html: "HTML web page structure and frontend development",

  css: "CSS styling responsive web design",

  git: "Git version control and source code management",

  github: "GitHub repository and collaborative development",

  docker: "Docker containerization and application deployment",

  sql: "SQL relational database queries",

  "machine learning":
    "machine learning artificial intelligence model development",

  "data analysis": "data analysis and data processing",

  pandas: "Pandas Python data analysis library",

  numpy: "NumPy numerical computing Python library",

  tensorflow: "TensorFlow machine learning and deep learning",

  communication: "communication and interpersonal communication skills",

  "problem solving": "problem solving analytical thinking skills",

  dsa: "data structures and algorithms programming",
};

const roleSkills = {
  "Software Developer": ["javascript", "java", "python", "sql", "dsa", "git"],

  "Frontend Developer": ["html", "css", "javascript", "react", "git"],

  "Backend Developer": [
    "node.js",
    "express",
    "mongodb",
    "sql",
    "git",
    "javascript",
  ],

  "Data Analyst": ["python", "sql", "pandas", "numpy", "data analysis"],

  "AI/ML Engineer": [
    "python",
    "machine learning",
    "tensorflow",
    "numpy",
    "pandas",
  ],
};

// ==========================================
// ANALYZE RESUME
// ==========================================

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF resume",
      });
    }

    const dataBuffer = fs.readFileSync(req.file.path);

    const pdfData = await pdfParse(dataBuffer);

    const extractedText = pdfData.text || "";

    if (!extractedText.trim()) {
      return res.status(400).json({
        message:
          "Could not extract text from this PDF. Please upload a text-based resume.",
      });
    }

    // ==========================================
    // SEMANTIC SKILL EXTRACTION
    // ==========================================

    const detectedSkills = [];

    for (const skill of commonSkills) {
      try {
        const description = skillDescriptions[skill] || skill;

        const similarity = await semanticSimilarity(extractedText, description);

        /*
          Direct keyword match OR semantic match.
          This makes the analyzer more robust than
          exact keyword matching alone.
        */

        const directMatch = extractedText
          .toLowerCase()
          .includes(skill.toLowerCase());

        if (directMatch || similarity >= 0.35) {
          detectedSkills.push(skill);
        }
      } catch (error) {
        console.error(`Semantic check failed for ${skill}:`, error.message);

        // Fallback to direct keyword matching
        if (extractedText.toLowerCase().includes(skill.toLowerCase())) {
          detectedSkills.push(skill);
        }
      }
    }

    // Remove duplicates
    const uniqueSkills = [...new Set(detectedSkills)];

    // ==========================================
    // TARGET ROLE
    // ==========================================

    const targetRole = req.user.targetRole || "Software Developer";

    const requiredSkills =
      roleSkills[targetRole] || roleSkills["Software Developer"];

    // ==========================================
    // MATCHED SKILLS
    // ==========================================

    const matchedSkills = requiredSkills.filter((skill) =>
      uniqueSkills.includes(skill),
    );

    // ==========================================
    // SKILL GAPS
    // ==========================================

    const skillGaps = requiredSkills.filter(
      (skill) => !uniqueSkills.includes(skill),
    );

    // ==========================================
    // READINESS SCORE
    // ==========================================

    const readinessScore =
      requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

    // ==========================================
    // SAVE RESUME
    // ==========================================

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      extractedText,
      skills: uniqueSkills,
      targetRole,
      skillGaps,
      readinessScore,
    });

    // ==========================================
    // DELETE TEMPORARY PDF
    // ==========================================

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      message: "Resume analyzed successfully",

      analysis: {
        resumeId: resume._id,
        fileName: resume.fileName,
        targetRole,
        skills: uniqueSkills,
        skillGaps,
        readinessScore,
      },
    });
  } catch (error) {
    console.error("RESUME ANALYSIS ERROR:", error);

    // Try to remove temporary file
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error("Temporary file cleanup failed:", deleteError.message);
      }
    }

    res.status(500).json({
      message: "Resume analysis failed",
      error: error.message,
    });
  }
};

// ==========================================
// GET LATEST RESUME
// ==========================================

const getLatestResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    if (!resume) {
      return res.status(404).json({
        message: "No resume found",
      });
    }

    res.status(200).json({
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        targetRole: resume.targetRole,
        skills: resume.skills,
        skillGaps: resume.skillGaps,
        readinessScore: resume.readinessScore,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("GET LATEST RESUME ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch latest resume",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeResume,
  getLatestResume,
};
