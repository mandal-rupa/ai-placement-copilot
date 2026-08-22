import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MockInterview.css";

function MockInterview() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // INTERVIEW SETTINGS
  // ==========================================

  const settings = location.state || {
    targetRole: "Frontend Developer",
    difficulty: "Medium",
    questionCount: 5,
  };

  const targetRole =
    settings.targetRole || "Frontend Developer";

  const difficulty =
    settings.difficulty || "Medium";

  // Force maximum 5 questions because
  // this interview currently contains 5 questions.
  const requestedQuestionCount =
    Number(settings.questionCount) || 5;

  const questionCount = Math.min(
    requestedQuestionCount,
    5
  );

  // ==========================================
  // QUESTIONS
  // ==========================================

  const questions = [
    {
      question:
        "Explain the difference between let, var and const in JavaScript.",
    },

    {
      question:
        "What is React and why is it used for frontend development?",
    },

    {
      question:
        "What is the difference between state and props in React?",
    },

    {
      question:
        "What is REST API and how does a frontend application use it?",
    },

    {
      question:
        "What is the purpose of Git and GitHub in software development?",
    },
  ].slice(0, questionCount);

  // ==========================================
  // STATES
  // ==========================================

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [evaluating, setEvaluating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showEvaluation, setShowEvaluation] =
    useState(false);

  const [currentEvaluation, setCurrentEvaluation] =
    useState(null);

  const [evaluations, setEvaluations] =
    useState([]);

  const [showResult, setShowResult] =
    useState(false);

  const [savingInterview, setSavingInterview] =
    useState(false);

  // ==========================================
  // CURRENT QUESTION
  // ==========================================

  const currentQuestionData =
    questions[currentQuestion];

  // ==========================================
  // CHECK LOGIN
  // ==========================================

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // ==========================================
  // SUBMIT ANSWER
  // ==========================================

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError(
        "Please enter your answer before submitting."
      );

      return;
    }

    setError("");
    setEvaluating(true);

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      console.log(
        "================================="
      );

      console.log(
        "Submitting interview answer"
      );

      console.log(
        "Question:",
        currentQuestionData.question
      );

      console.log(
        "Answer:",
        answer
      );

      console.log(
        "================================="
      );

      // ==========================================
      // AI EVALUATION API
      // ==========================================

      const response = await fetch(
        "http://localhost:5000/api/interview/evaluate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            role: targetRole,

            question:
              currentQuestionData.question,

            answer:
              answer.trim(),

            difficulty,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "AI Evaluation Response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to evaluate answer."
        );
      }

      // ==========================================
      // GET EVALUATION
      // ==========================================

      const evaluationData =
        data.evaluation || data;

      // ==========================================
      // SAFE SCORE
      // ==========================================

      const rawScore =
        Number(
          evaluationData.score
        );

      const safeScore =
        Number.isFinite(rawScore)
          ? Math.max(
              0,
              Math.min(
                10,
                rawScore
              )
            )
          : 0;

      // ==========================================
      // NORMALIZED EVALUATION
      // ==========================================

      const evaluation = {
        question:
          currentQuestionData.question,

        answer:
          answer.trim(),

        score:
          safeScore,

        verdict:
          evaluationData.verdict ||
          "Needs Improvement",

        correctPoints:
          Array.isArray(
            evaluationData.correctPoints
          )
            ? evaluationData.correctPoints
            : [],

        missingPoints:
          Array.isArray(
            evaluationData.missingPoints
          )
            ? evaluationData.missingPoints
            : [],

        feedback:
          evaluationData.feedback ||
          "No feedback was provided.",

        idealAnswer:
          evaluationData.idealAnswer ||
          "No ideal answer was provided.",
      };

      console.log(
        "Normalized Evaluation:",
        evaluation
      );

      // ==========================================
      // SAVE EVALUATION
      // ==========================================

      setEvaluations(
        (previousEvaluations) => [
          ...previousEvaluations,
          evaluation,
        ]
      );

      // ==========================================
      // SHOW EVALUATION
      // ==========================================

      setCurrentEvaluation(
        evaluation
      );

      setShowEvaluation(true);

    } catch (err) {
      console.error(
        "Interview evaluation error:",
        err
      );

      setError(
        err.message ||
          "Unable to evaluate your answer."
      );

    } finally {
      setEvaluating(false);
    }
  };

  // ==========================================
  // TOTAL SCORE
  // ==========================================

  const totalScore =
    evaluations.reduce(
      (total, item) =>
        total +
        Number(item.score || 0),
      0
    );

  // ==========================================
  // OVERALL SCORE
  // ==========================================

  const overallScore =
    evaluations.length > 0
      ? Math.round(
          (totalScore /
            (evaluations.length * 10)) *
            100
        )
      : 0;

  // ==========================================
  // TECHNICAL KNOWLEDGE
  // ==========================================

  const technicalKnowledgeScore =
    evaluations.length > 0
      ? Math.round(
          evaluations.reduce(
            (total, item) =>
              total +
              Number(
                item.score || 0
              ),
            0
          ) /
            (evaluations.length * 10) *
            100
        )
      : 0;

  // ==========================================
  // ANSWER QUALITY
  // ==========================================

  const answerQualityScore =
    evaluations.length > 0
      ? Math.round(
          evaluations.reduce(
            (total, item) => {
              const correct =
                Array.isArray(
                  item.correctPoints
                )
                  ? item.correctPoints.length
                  : 0;

              const missing =
                Array.isArray(
                  item.missingPoints
                )
                  ? item.missingPoints.length
                  : 0;

              const totalPoints =
                correct + missing;

              if (
                totalPoints === 0
              ) {
                return total;
              }

              return (
                total +
                (correct /
                  totalPoints) *
                  100
              );
            },
            0
          ) /
            evaluations.length
        )
      : 0;

  // ==========================================
  // INTERVIEW PERFORMANCE
  // ==========================================

  const interviewPerformanceScore =
    overallScore;

  // ==========================================
  // SCORE LABEL
  // ==========================================

  const getScoreLabel = (
    score
  ) => {
    if (score >= 80) {
      return "Excellent";
    }

    if (score >= 60) {
      return "Good";
    }

    if (score >= 40) {
      return "Needs Improvement";
    }

    return "Poor";
  };

  // ==========================================
  // SAVE INTERVIEW TO DATABASE
  // ==========================================

  const saveInterviewToDatabase =
    async (
      evaluationsToSave
    ) => {
      try {
        setSavingInterview(true);
        setError("");

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          navigate("/login");
          return false;
        }

        // ==========================================
        // REMOVE DUPLICATES
        // ==========================================

        const uniqueEvaluations = [];

        evaluationsToSave.forEach(
          (item) => {
            const alreadyExists =
              uniqueEvaluations.some(
                (existingItem) =>
                  existingItem.question ===
                  item.question
              );

            if (
              !alreadyExists &&
              uniqueEvaluations.length <
                questions.length
            ) {
              uniqueEvaluations.push(
                item
              );
            }
          }
        );

        console.log(
          "================================="
        );

        console.log(
          "Final evaluations to save:",
          uniqueEvaluations
        );

        console.log(
          "Final question count:",
          uniqueEvaluations.length
        );

        console.log(
          "Expected question count:",
          questions.length
        );

        console.log(
          "================================="
        );

        // ==========================================
        // SAFETY CHECK
        // ==========================================

        if (
          uniqueEvaluations.length !==
          questions.length
        ) {
          throw new Error(
            `Interview data mismatch. Expected ${questions.length} questions but got ${uniqueEvaluations.length}.`
          );
        }

        // ==========================================
        // SAVE API
        // ==========================================

        const response =
          await fetch(
            "http://localhost:5000/api/interview/save",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                role:
                  targetRole,

                difficulty:
                  difficulty,

                questions:
                  uniqueEvaluations,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "Interview Save Response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to save interview."
          );
        }

        console.log(
          "Interview saved successfully."
        );

        return true;

      } catch (err) {
        console.error(
          "Interview save error:",
          err
        );

        setError(
          err.message ||
            "Interview could not be saved."
        );

        return false;

      } finally {
        setSavingInterview(false);
      }
    };

  // ==========================================
  // CONTINUE TO NEXT QUESTION
  // ==========================================

  const continueToNextQuestion =
    async () => {

      setShowEvaluation(false);

      setError("");

      // ==========================================
      // MORE QUESTIONS
      // ==========================================

      if (
        currentQuestion <
        questions.length - 1
      ) {

        setCurrentQuestion(
          (previous) =>
            previous + 1
        );

        setAnswer("");

        setCurrentEvaluation(
          null
        );

        return;
      }

      // ==========================================
      // LAST QUESTION
      // ==========================================

      /*
        React state updates are asynchronous.

        So we create the final list manually.
      */

      const finalEvaluations = [
        ...evaluations,
      ];

      // ==========================================
      // ADD CURRENT EVALUATION ONLY IF NEEDED
      // ==========================================

      if (
        currentEvaluation
      ) {

        const alreadyExists =
          finalEvaluations.some(
            (item) =>
              item.question ===
              currentEvaluation.question
          );

        if (
          !alreadyExists
        ) {
          finalEvaluations.push(
            currentEvaluation
          );
        }
      }

      console.log(
        "Final evaluations:",
        finalEvaluations
      );

      console.log(
        "Final count:",
        finalEvaluations.length
      );

      // ==========================================
      // SAFETY CHECK
      // ==========================================

      if (
        finalEvaluations.length !==
        questions.length
      ) {

        console.error(
          "Question count mismatch"
        );

        setError(
          `Interview data mismatch. Expected ${questions.length} questions but got ${finalEvaluations.length}.`
        );

        setShowEvaluation(
          true
        );

        return;
      }

      // ==========================================
      // UPDATE STATE
      // ==========================================

      setEvaluations(
        finalEvaluations
      );

      setCurrentEvaluation(
        null
      );

      setAnswer("");

      // ==========================================
      // SAVE
      // ==========================================

      const saved =
        await saveInterviewToDatabase(
          finalEvaluations
        );

      // ==========================================
      // SHOW RESULT
      // ==========================================

      if (saved) {
        setShowResult(true);
      }
    };

  // ==========================================
  // FINAL RESULT SCREEN
  // ==========================================

  if (showResult) {

    return (
      <div className="interview-page">

        <div className="interview-container">

          <div className="result-card">

            {/* CHECK */}

            <div className="result-check">
              ✓
            </div>

            {/* LABEL */}

            <span className="interview-label">
              AI MOCK INTERVIEW
            </span>

            {/* TITLE */}

            <h1>
              Interview Completed!
            </h1>

            <p className="result-subtitle">
              Your interview has been
              evaluated.
            </p>

            <div className="result-divider"></div>

            {/* OVERALL SCORE */}

            <span className="result-label">
              OVERALL SCORE
            </span>

            <div className="result-score-circle">

              <strong>
                {overallScore}%
              </strong>

              <span>
                {getScoreLabel(
                  overallScore
                )}
              </span>

            </div>

            {/* STATS */}

            <div className="result-stats">

              <div className="result-stat">

                <span>
                  Questions
                </span>

                <strong>
                  {evaluations.length} /{" "}
                  {questions.length}
                </strong>

                <small>
                  Attempted
                </small>

              </div>

              <div className="result-stat">

                <span>
                  Difficulty
                </span>

                <strong>
                  {difficulty}
                </strong>

                <small>
                  Selected
                </small>

              </div>

            </div>

            {/* PERFORMANCE BREAKDOWN */}

            <div className="performance-section">

              <span className="result-label">
                PERFORMANCE BREAKDOWN
              </span>

              {/* TECHNICAL KNOWLEDGE */}

              <div className="performance-card">

                <span className="performance-icon">
                  ◇
                </span>

                <p>
                  Technical Knowledge
                </p>

                <strong>
                  {
                    technicalKnowledgeScore
                  }%
                </strong>

                <small>
                  {
                    getScoreLabel(
                      technicalKnowledgeScore
                    )
                  }
                </small>

              </div>

              {/* ANSWER QUALITY */}

              <div className="performance-card">

                <span className="performance-icon">
                  ◌
                </span>

                <p>
                  Answer Quality
                </p>

                <strong>
                  {
                    answerQualityScore
                  }%
                </strong>

                <small>
                  AI Evaluation
                </small>

              </div>

              {/* INTERVIEW PERFORMANCE */}

              <div className="performance-card">

                <span className="performance-icon">
                  ✦
                </span>

                <p>
                  Interview Performance
                </p>

                <strong>
                  {
                    interviewPerformanceScore
                  }%
                </strong>

                <small>
                  Overall
                </small>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="interview-error">
                {error}
              </div>
            )}

            {/* DASHBOARD */}

            <button
              className="finish-interview-btn"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
              disabled={
                savingInterview
              }
            >
              Back to Dashboard →
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // EVALUATION SCREEN
  // ==========================================

  if (
    showEvaluation &&
    currentEvaluation
  ) {

    return (
      <div className="interview-page">

        <div className="interview-container">

          <div className="evaluation-card">

            {/* LABEL */}

            <span className="evaluation-label">

              QUESTION{" "}
              {currentQuestion + 1}{" "}
              EVALUATION

            </span>

            <h1>
              How did you perform?
            </h1>

            {/* SCORE */}

            <div className="evaluation-score">

              <strong>
                {
                  currentEvaluation.score
                }/10
              </strong>

              <span>
                {
                  currentEvaluation.verdict
                }
              </span>

            </div>

            <div className="evaluation-divider"></div>

            {/* CORRECT POINTS */}

            {currentEvaluation
              .correctPoints
              .length > 0 && (

              <div className="evaluation-section success">

                <h3>
                  ✓ What You Did Well
                </h3>

                <ul>

                  {currentEvaluation
                    .correctPoints
                    .map(
                      (
                        point,
                        index
                      ) => (

                        <li
                          key={index}
                        >
                          {point}
                        </li>

                      )
                    )}

                </ul>

              </div>
            )}

            {/* MISSING POINTS */}

            {currentEvaluation
              .missingPoints
              .length > 0 && (

              <div className="evaluation-section missing">

                <h3>
                  + What You Missed
                </h3>

                <ul>

                  {currentEvaluation
                    .missingPoints
                    .map(
                      (
                        point,
                        index
                      ) => (

                        <li
                          key={index}
                        >
                          {point}
                        </li>

                      )
                    )}

                </ul>

              </div>
            )}

            {/* FEEDBACK */}

            <div className="evaluation-section">

              <h3>
                ✦ AI Interview Feedback
              </h3>

              <p>
                {
                  currentEvaluation.feedback
                }
              </p>

            </div>

            {/* IDEAL ANSWER */}

            <div className="ideal-answer-box">

              <span>
                IDEAL ANSWER
              </span>

              <p>
                {
                  currentEvaluation.idealAnswer
                }
              </p>

            </div>

            {/* CONTINUE */}

            <button
              className="continue-interview-btn"
              onClick={
                continueToNextQuestion
              }
              disabled={
                savingInterview
              }
            >

              {savingInterview
                ? "Saving Interview..."
                : currentQuestion ===
                  questions.length - 1
                ? "Save & View Final Results →"
                : "Continue to Next Question →"}

            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // INTERVIEW SCREEN
  // ==========================================

  return (
    <div className="interview-page">

      <div className="interview-container">

        {/* HEADER */}

        <div className="interview-header">

          <div>

            <span className="interview-label">
              AI MOCK INTERVIEW
            </span>

            <h1>
              {targetRole}
            </h1>

            <p>
              Difficulty:{" "}
              {difficulty}
            </p>

          </div>

          <div className="question-counter">

            <strong>
              {currentQuestion + 1}
            </strong>

            <span>
              / {questions.length}
            </span>

          </div>

        </div>

        {/* QUESTION CARD */}

        <div className="question-card">

          <span className="question-label">

            QUESTION{" "}
            {currentQuestion + 1}

          </span>

          <h2>
            {
              currentQuestionData.question
            }
          </h2>

          {/* ANSWER */}

          <textarea
            value={answer}
            onChange={(event) => {

              setAnswer(
                event.target.value
              );

              setError("");

            }}
            placeholder="Type your answer here..."
            disabled={
              evaluating
            }
          />

          {/* CHARACTER COUNT */}

          <div className="answer-footer">

            <span>
              {answer.length}{" "}
              characters
            </span>

          </div>

          {/* ERROR */}

          {error && (
            <div className="interview-error">
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            className="submit-answer-btn"
            onClick={
              submitAnswer
            }
            disabled={
              evaluating ||
              !answer.trim()
            }
          >

            {evaluating
              ? "AI is evaluating your answer..."
              : currentQuestion ===
                questions.length - 1
              ? "Submit & Finish →"
              : "Submit & Evaluate →"}

          </button>

        </div>

      </div>

    </div>
  );
}

export default MockInterview;