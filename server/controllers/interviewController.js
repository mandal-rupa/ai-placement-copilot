const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const User = require("../models/user");

const {
  semanticSimilarity,
} = require("../services/aiService");

// ==========================================
// AI INTERVIEW ANSWER EVALUATOR
// ==========================================

const evaluateInterviewAnswer = async (req, res) => {
  try {
    const {
      role,
      difficulty,
      question,
      answer,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!role || !question || !answer) {
      return res.status(400).json({
        message:
          "Role, question and answer are required.",
      });
    }

    const cleanAnswer = answer
      .trim()
      .toLowerCase();

    // ==========================================
    // EMPTY / RANDOM ANSWER
    // ==========================================

    if (
      cleanAnswer.length < 5 ||
      isRandomAnswer(cleanAnswer)
    ) {
      return res.json({
        success: true,

        evaluation: {
          score: 0,

          verdict: "Incorrect",

          correctPoints: [],

          missingPoints: [
            "The answer does not address the question.",
          ],

          feedback:
            "Your answer is not relevant to the interview question. Explain the concept directly and include important technical points.",

          idealAnswer:
            getIdealAnswer(question),

          semanticSimilarity: 0,

          keywordCoverage: 0,
        },
      });
    }

    // ==========================================
    // EXPECTED ANSWER DATA
    // ==========================================

    const expected =
      getExpectedKeywords(question);

    const idealAnswer =
      getIdealAnswer(question);

    // ==========================================
    // KEYWORD MATCHING
    // ==========================================

    const matchedKeywords =
      expected.keywords.filter((keyword) =>
        cleanAnswer.includes(
          keyword.toLowerCase()
        )
      );

    const missingKeywords =
      expected.keywords.filter(
        (keyword) =>
          !cleanAnswer.includes(
            keyword.toLowerCase()
          )
      );

    const keywordPercentage =
      expected.keywords.length > 0
        ? matchedKeywords.length /
          expected.keywords.length
        : 0;

    // ==========================================
    // SEMANTIC SIMILARITY
    // ==========================================

    let semanticScore = 0;

    try {
      semanticScore =
        await semanticSimilarity(
          answer,
          idealAnswer
        );
    } catch (semanticError) {
      console.error(
        "Semantic evaluation error:",
        semanticError.message
      );

      // Fallback to keyword evaluation
      semanticScore = 0;
    }

    // ==========================================
    // FINAL SCORE
    // ==========================================
    //
    // Keyword coverage       = 40%
    // Semantic similarity    = 60%
    //
    // ==========================================

    let score = Math.round(
      (
        keywordPercentage * 0.4 +
        semanticScore * 0.6
      ) * 10
    );

    // ==========================================
    // RELEVANCE CHECK
    // ==========================================

    const relevanceMatches =
      expected.relevance.filter(
        (keyword) =>
          cleanAnswer.includes(
            keyword.toLowerCase()
          )
      );

    /*
      If neither the keywords nor semantic
      similarity indicate relevance,
      mark the answer incorrect.
    */

    if (
      relevanceMatches.length === 0 &&
      semanticScore < 0.30
    ) {
      score = 0;
    }

    // ==========================================
    // SCORE LIMIT
    // ==========================================

    score = Math.max(
      0,
      Math.min(10, score)
    );

    // ==========================================
    // VERDICT
    // ==========================================

    let verdict;

    if (score === 0) {
      verdict = "Incorrect";
    } else if (score <= 3) {
      verdict = "Needs Major Improvement";
    } else if (score <= 5) {
      verdict = "Partially Correct";
    } else if (score <= 7) {
      verdict = "Good";
    } else {
      verdict = "Excellent";
    }

    // ==========================================
    // CORRECT POINTS
    // ==========================================

    const correctPoints =
      matchedKeywords.map(
        (keyword) =>
          expected.explanations[
            keyword
          ] ||
          `Mentioned ${keyword}.`
      );

    // ==========================================
    // MISSING POINTS
    // ==========================================

    const missingPoints =
      missingKeywords.map(
        (keyword) =>
          expected.explanations[
            keyword
          ] ||
          `Explain ${keyword}.`
      );

    // ==========================================
    // FEEDBACK
    // ==========================================

    let feedback;

    if (score === 0) {
      feedback =
        "Your answer does not sufficiently address the question. Explain the concept directly and include relevant technical details.";
    } else if (score <= 3) {
      feedback =
        "Your answer has limited relevance. Focus on the main concept and explain the important technical points clearly.";
    } else if (score <= 5) {
      feedback =
        "Your answer is partially correct. Add the missing technical concepts and provide a clearer explanation.";
    } else if (score <= 7) {
      feedback =
        "Good answer. Your response is relevant and covers several important concepts. Add more technical detail or an example to make it stronger.";
    } else {
      feedback =
        "Excellent answer. Your response is highly relevant and semantically aligned with the expected answer while covering important technical concepts.";
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.json({
      success: true,

      evaluation: {
        score,

        verdict,

        semanticSimilarity: Number(
          semanticScore.toFixed(3)
        ),

        keywordCoverage: Math.round(
          keywordPercentage * 100
        ),

        correctPoints,

        missingPoints,

        feedback,

        idealAnswer,
      },
    });
  } catch (error) {
    console.error(
      "AI Interview Evaluation Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Interview evaluation failed.",

      error: error.message,
    });
  }
};

// ==========================================
// RANDOM ANSWER DETECTION
// ==========================================

const isRandomAnswer = (answer) => {
  const randomPatterns = [
    "hghh",
    "hhhhh",
    "jjjk",
    "jjkk",
    "jijk",
    "bvnnnnn",
    "asdf",
    "asdfgh",
    "qwerty",
    "hello",
    "test",
    "testing",
    "www",
    "wwww",
    "abc",
    "abcd",
    "xyz",
    "xxx",
  ];

  return randomPatterns.includes(answer);
};

// ==========================================
// QUESTION KEYWORDS
// ==========================================

const getExpectedKeywords = (question) => {
  const q = question.toLowerCase();

  // ==========================================
  // LET VAR CONST
  // ==========================================

  if (
    q.includes("let") &&
    q.includes("var") &&
    q.includes("const")
  ) {
    return {
      keywords: [
        "let",
        "var",
        "const",
        "scope",
        "block",
        "redeclare",
      ],

      relevance: [
        "let",
        "var",
        "const",
        "scope",
        "block",
      ],

      explanations: {
        let:
          "Explained let as a variable declaration.",

        var:
          "Explained var as a variable declaration.",

        const:
          "Explained const as a variable declaration.",

        scope:
          "Mentioned variable scope.",

        block:
          "Mentioned block scope.",

        redeclare:
          "Mentioned redeclaration behavior.",
      },
    };
  }

  // ==========================================
  // REACT
  // ==========================================

  if (q.includes("what is react")) {
    return {
      keywords: [
        "library",
        "javascript",
        "component",
        "ui",
        "frontend",
      ],

      relevance: [
        "react",
        "library",
        "javascript",
        "component",
        "ui",
        "frontend",
      ],

      explanations: {
        library:
          "React is a JavaScript library.",

        javascript:
          "Mentioned JavaScript.",

        component:
          "Mentioned component-based development.",

        ui:
          "Mentioned user interface development.",

        frontend:
          "Connected React with frontend development.",
      },
    };
  }

  // ==========================================
  // STATE AND PROPS
  // ==========================================

  if (
    q.includes("state") &&
    q.includes("props")
  ) {
    return {
      keywords: [
        "state",
        "props",
        "component",
        "change",
        "parent",
      ],

      relevance: [
        "state",
        "props",
      ],

      explanations: {
        state:
          "Explained React state.",

        props:
          "Explained React props.",

        component:
          "Mentioned components.",

        change:
          "Mentioned changing component data.",

        parent:
          "Mentioned data passed from a parent component.",
      },
    };
  }

  // ==========================================
  // REST API
  // ==========================================

  if (q.includes("rest api")) {
    return {
      keywords: [
        "api",
        "http",
        "get",
        "post",
        "request",
        "response",
        "endpoint",
      ],

      relevance: [
        "api",
        "http",
        "request",
        "response",
        "endpoint",
      ],

      explanations: {
        api:
          "Explained the API concept.",

        http:
          "Mentioned HTTP communication.",

        get:
          "Mentioned GET requests.",

        post:
          "Mentioned POST requests.",

        request:
          "Mentioned requests.",

        response:
          "Mentioned responses.",

        endpoint:
          "Mentioned API endpoints.",
      },
    };
  }

  // ==========================================
  // GIT AND GITHUB
  // ==========================================

  if (
    q.includes("git") &&
    q.includes("github")
  ) {
    return {
      keywords: [
        "git",
        "version",
        "control",
        "github",
        "repository",
        "code",
      ],

      relevance: [
        "git",
        "github",
        "repository",
        "version",
      ],

      explanations: {
        git:
          "Mentioned Git version control.",

        version:
          "Mentioned version control.",

        control:
          "Explained source/version control.",

        github:
          "Mentioned GitHub.",

        repository:
          "Mentioned repositories.",

        code:
          "Connected Git/GitHub with code management.",
      },
    };
  }

  // ==========================================
  // DEFAULT
  // ==========================================

  return {
    keywords: [
      "explain",
      "concept",
      "example",
    ],

    relevance: [
      "explain",
      "concept",
    ],

    explanations: {},
  };
};

// ==========================================
// IDEAL ANSWERS
// ==========================================

const getIdealAnswer = (question) => {
  const q = question.toLowerCase();

  // ==========================================
  // LET VAR CONST
  // ==========================================

  if (
    q.includes("let") &&
    q.includes("var") &&
    q.includes("const")
  ) {
    return `
let and const are block-scoped variables, while var is function-scoped.

let can be reassigned but cannot be redeclared in the same scope.

const cannot be reassigned after initialization.

var can be redeclared and is function-scoped.

In modern JavaScript, let and const are generally preferred over var.
`;
  }

  // ==========================================
  // REACT
  // ==========================================

  if (q.includes("what is react")) {
    return `
React is a JavaScript library used for building user interfaces.

It uses reusable components and a declarative approach to create interactive frontend applications.
`;
  }

  // ==========================================
  // STATE AND PROPS
  // ==========================================

  if (
    q.includes("state") &&
    q.includes("props")
  ) {
    return `
Props are data passed from a parent component to a child component and are generally read-only.

State is data managed by a component that can change over time and cause the component to re-render.
`;
  }

  // ==========================================
  // REST API
  // ==========================================

  if (q.includes("rest api")) {
    return `
A REST API allows applications to communicate over HTTP.

Common HTTP methods include GET, POST, PUT, PATCH and DELETE.

The frontend sends requests to API endpoints and receives responses from the backend.
`;
  }

  // ==========================================
  // GIT AND GITHUB
  // ==========================================

  if (
    q.includes("git") &&
    q.includes("github")
  ) {
    return `
Git is a distributed version control system used to track changes in source code.

GitHub is a platform for hosting Git repositories and collaborating with other developers.

Git helps developers manage versions, branches and changes, while GitHub provides remote repository hosting and collaboration features.
`;
  }

  // ==========================================
  // DEFAULT
  // ==========================================

  return `
Provide a clear and technically correct explanation of the concept asked in the question, including important terminology and a relevant example.
`;
};

// ==========================================
// SAVE COMPLETED INTERVIEW
// ==========================================

const saveInterview = async (req, res) => {
  try {
    const {
      role,
      difficulty,
      questions,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!role) {
      return res.status(400).json({
        message: "Role is required.",
      });
    }

    if (!difficulty) {
      return res.status(400).json({
        message: "Difficulty is required.",
      });
    }

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        message: "Questions must be an array.",
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({
        message:
          "At least one question is required.",
      });
    }

    // ==========================================
    // NORMALIZE QUESTION SCORES
    // ==========================================

    const cleanedQuestions =
      questions.map((question) => {
        const score = Math.max(
          0,
          Math.min(
            10,
            Number(question.score) || 0
          )
        );

        return {
          question:
            question.question || "",

          answer:
            question.answer || "",

          score,

          verdict:
            question.verdict || "",

          feedback:
            question.feedback || "",

          correctPoints:
            Array.isArray(
              question.correctPoints
            )
              ? question.correctPoints
              : [],

          missingPoints:
            Array.isArray(
              question.missingPoints
            )
              ? question.missingPoints
              : [],

          idealAnswer:
            question.idealAnswer || "",

          semanticSimilarity:
            Number(
              question.semanticSimilarity
            ) || 0,

          keywordCoverage:
            Number(
              question.keywordCoverage
            ) || 0,
        };
      });

    // ==========================================
    // TOTAL SCORE
    // ==========================================

    const totalScore =
      cleanedQuestions.reduce(
        (total, question) =>
          total + question.score,
        0
      );

    const totalQuestions =
      cleanedQuestions.length;

    // ==========================================
    // CREATE INTERVIEW
    // ==========================================

    const interview =
      await Interview.create({
        user: req.user._id,

        role,

        difficulty,

        questions:
          cleanedQuestions,

        overallScore:
          totalScore,

        totalQuestions:
          totalQuestions,
      });

    // ==========================================
    // INTERVIEW PERCENTAGE
    // ==========================================

    const maxScore =
      totalQuestions * 10;

    const interviewPercentage =
      maxScore > 0
        ? Math.round(
            (totalScore / maxScore) *
              100
          )
        : 0;

    // ==========================================
    // GET LATEST RESUME
    // ==========================================

    const latestResume =
      await Resume.findOne({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    // ==========================================
    // PLACEMENT READINESS
    // ==========================================

    let placementReadiness =
      interviewPercentage;

    if (latestResume) {
      const resumeScore =
        Number(
          latestResume.readinessScore
        ) || 0;

      placementReadiness =
        Math.round(
          (resumeScore +
            interviewPercentage) /
            2
        );
    }

    // ==========================================
    // SAVE READINESS SCORE
    // ==========================================

    await User.findByIdAndUpdate(
      req.user._id,
      {
        readinessScore:
          placementReadiness,
      },
      {
        new: true,
      }
    );

    console.log(
      "Placement Readiness Updated:",
      placementReadiness
    );

    // ==========================================
    // PERFORMANCE
    // ==========================================

    let performance;

    if (interviewPercentage >= 80) {
      performance = "Excellent";
    } else if (
      interviewPercentage >= 60
    ) {
      performance = "Good";
    } else if (
      interviewPercentage >= 40
    ) {
      performance = "Needs Improvement";
    } else {
      performance = "Poor";
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,

      message:
        "Interview saved successfully.",

      interview,

      score: {
        totalScore,

        maxScore,

        percentage:
          interviewPercentage,

        performance,
      },

      placementReadiness,
    });
  } catch (error) {
    console.error(
      "Save Interview Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to save interview.",

      error: error.message,
    });
  }
};

// ==========================================
// GET INTERVIEW HISTORY
// ==========================================

const getInterviewHistory = async (
  req,
  res
) => {
  try {
    const interviews =
      await Interview.find({
        user: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .select(
          "role difficulty overallScore totalQuestions createdAt"
        );

    return res.status(200).json({
      success: true,

      interviews,
    });
  } catch (error) {
    console.error(
      "Interview History Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch interview history.",
    });
  }
};

// ==========================================
// GET SINGLE INTERVIEW DETAILS
// ==========================================

const getInterviewById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const interview =
      await Interview.findOne({
        _id: id,

        user: req.user._id,
      });

    if (!interview) {
      return res.status(404).json({
        message:
          "Interview not found.",
      });
    }

    return res.status(200).json({
      success: true,

      interview,
    });
  } catch (error) {
    console.error(
      "Get Interview Details Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch interview details.",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  evaluateInterviewAnswer,
  saveInterview,
  getInterviewHistory,
  getInterviewById,
};