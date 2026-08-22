const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      required: true,
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        answer: {
          type: String,
          required: true,
        },

        score: {
          type: Number,
          default: 0,
        },

        verdict: {
          type: String,
          default: "",
        },

        feedback: {
          type: String,
          default: "",
        },

        correctPoints: {
          type: [String],
          default: [],
        },

        missingPoints: {
          type: [String],
          default: [],
        },

        idealAnswer: {
          type: String,
          default: "",
        },
      },
    ],

    overallScore: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Interview",
  interviewSchema
);