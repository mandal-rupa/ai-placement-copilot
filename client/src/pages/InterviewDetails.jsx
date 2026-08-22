import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import "./InterviewDetails.css";

function InterviewDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH INTERVIEW DETAILS
  // ==========================================

  useEffect(() => {
    console.log(
      "InterviewDetails URL ID:",
      id
    );

    if (!id || id === "undefined") {
      setError(
        "Interview ID is missing from the URL."
      );

      setLoading(false);

      return;
    }

    fetchInterviewDetails();
  }, [id]);

  // ==========================================
  // API REQUEST
  // ==========================================

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      console.log(
        "Fetching interview details for ID:",
        id
      );

      const url =
        `http://localhost:5000/api/interview/history/${id}`;

      console.log(
        "Interview Details API:",
        url
      );

      const response =
        await axios.get(
          url,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "Interview Details Response:",
        response.data
      );

      if (
        !response.data ||
        !response.data.interview
      ) {
        throw new Error(
          "Interview data was not returned by the server."
        );
      }

      setInterview(
        response.data.interview
      );

    } catch (err) {
      console.error(
        "Interview details error:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load interview details."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // QUESTION SCORE
  // ==========================================

  const getQuestionScore = (score) => {
    const value =
      Number(score) || 0;

    return Math.max(
      0,
      Math.min(10, value)
    );
  };

  // ==========================================
  // OVERALL PERCENTAGE
  // ==========================================

  const getOverallPercentage = () => {
    if (!interview) {
      return 0;
    }

    const totalQuestions =
      Number(
        interview.totalQuestions
      ) ||
      interview.questions?.length ||
      0;

    const overallScore =
      Number(
        interview.overallScore
      ) || 0;

    if (totalQuestions <= 0) {
      return 0;
    }

    return Math.round(
      (overallScore /
        (totalQuestions * 10)) *
        100
    );
  };

  // ==========================================
  // SCORE LABEL
  // ==========================================

  const getScoreLabel = (
    percentage
  ) => {
    if (percentage >= 80) {
      return "Excellent";
    }

    if (percentage >= 60) {
      return "Good";
    }

    if (percentage >= 40) {
      return "Needs Improvement";
    }

    return "Needs Practice";
  };

  // ==========================================
  // VERDICT CLASS
  // ==========================================

  const getVerdictClass = (
    verdict
  ) => {
    const value =
      (verdict || "").toLowerCase();

    if (
      value.includes("excellent")
    ) {
      return "verdict-excellent";
    }

    if (
      value.includes("correct")
    ) {
      return "verdict-correct";
    }

    if (
      value.includes("partial")
    ) {
      return "verdict-partial";
    }

    return "verdict-incorrect";
  };

  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="details-page">

        <div className="details-container">

          <div className="details-loading">

            Loading interview details...

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="details-page">

        <div className="details-container">

          <button
            className="back-btn"
            onClick={() =>
              navigate(
                "/interview-history"
              )
            }
          >
            ← Interview History
          </button>


          <div className="details-error">

            <h2>
              Unable to load interview
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={
                fetchInterviewDetails
              }
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // NO INTERVIEW
  // ==========================================

  if (!interview) {
    return (
      <div className="details-page">

        <div className="details-container">

          <button
            className="back-btn"
            onClick={() =>
              navigate(
                "/interview-history"
              )
            }
          >
            ← Interview History
          </button>


          <div className="details-error">

            <h2>
              Interview not found
            </h2>

            <p>
              This interview could not
              be found.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // CALCULATE SCORE
  // ==========================================

  const overallPercentage =
    getOverallPercentage();

  const scoreLabel =
    getScoreLabel(
      overallPercentage
    );

  const questions =
    interview.questions || [];

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="details-page">

      <div className="details-container">

        {/* ==================================
            BACK BUTTON
        =================================== */}

        <button
          className="back-btn"
          onClick={() =>
            navigate(
              "/interview-history"
            )
          }
        >
          ← Interview History
        </button>


        {/* ==================================
            HEADER
        =================================== */}

        <div className="details-heading">

          <span>
            INTERVIEW DETAILS
          </span>

          <h1>
            {interview.role ||
              "Software Developer"}
          </h1>

          <p>
            {interview.difficulty ||
              "Medium"}{" "}
            Difficulty
          </p>

          {interview.createdAt && (
            <small>
              Completed on{" "}
              {formatDate(
                interview.createdAt
              )}
            </small>
          )}

        </div>


        {/* ==================================
            SUMMARY
        =================================== */}

        <div className="details-summary">

          {/* SCORE */}

          <div className="summary-card">

            <span>
              OVERALL SCORE
            </span>

            <strong>
              {overallPercentage}%
            </strong>

            <small>
              {scoreLabel}
            </small>

          </div>


          {/* QUESTIONS */}

          <div className="summary-card">

            <span>
              QUESTIONS
            </span>

            <strong>
              {
                interview.totalQuestions ||
                questions.length
              }
            </strong>

            <small>
              Attempted
            </small>

          </div>


          {/* DIFFICULTY */}

          <div className="summary-card">

            <span>
              DIFFICULTY
            </span>

            <strong className="difficulty-value">

              {interview.difficulty ||
                "Medium"}

            </strong>

            <small>
              Selected
            </small>

          </div>

        </div>


        {/* ==================================
            QUESTIONS
        =================================== */}

        <div className="details-question-list">

          {questions.length === 0 ? (

            <div className="details-error">

              <p>
                No question details
                available.
              </p>

            </div>

          ) : (

            questions.map(
              (item, index) => {

                const score =
                  getQuestionScore(
                    item.score
                  );

                return (
                  <div
                    className="details-question-card"
                    key={
                      item._id ||
                      index
                    }
                  >

                    {/* QUESTION HEADER */}

                    <div className="question-header">

                      <span>
                        QUESTION{" "}
                        {index + 1}
                      </span>

                      <strong>
                        {score}/10
                      </strong>

                    </div>


                    {/* QUESTION */}

                    <h2>
                      {item.question ||
                        "Question unavailable"}
                    </h2>


                    {/* ANSWER */}

                    <div className="answer-section">

                      <span>
                        YOUR ANSWER
                      </span>

                      <p>
                        {item.answer ||
                          "No answer provided."}
                      </p>

                    </div>


                    {/* VERDICT */}

                    <div className="verdict-section">

                      <span>
                        VERDICT
                      </span>

                      <strong
                        className={getVerdictClass(
                          item.verdict
                        )}
                      >
                        {item.verdict ||
                          "Evaluated"}
                      </strong>

                    </div>


                    {/* FEEDBACK */}

                    {item.feedback && (
                      <div className="feedback-section">

                        <span>
                          INTERVIEW FEEDBACK
                        </span>

                        <p>
                          {item.feedback}
                        </p>

                      </div>
                    )}


                    {/* CORRECT POINTS */}

                    {item.correctPoints &&
                      item.correctPoints.length >
                        0 && (

                        <div className="points-section correct">

                          <span>
                            WHAT YOU GOT RIGHT
                          </span>

                          <ul>

                            {item.correctPoints.map(
                              (
                                point,
                                i
                              ) => (
                                <li key={i}>
                                  {point}
                                </li>
                              )
                            )}

                          </ul>

                        </div>
                      )}


                    {/* MISSING POINTS */}

                    {item.missingPoints &&
                      item.missingPoints.length >
                        0 && (

                        <div className="points-section missing">

                          <span>
                            WHAT YOU MISSED
                          </span>

                          <ul>

                            {item.missingPoints.map(
                              (
                                point,
                                i
                              ) => (
                                <li key={i}>
                                  {point}
                                </li>
                              )
                            )}

                          </ul>

                        </div>
                      )}


                    {/* IDEAL ANSWER */}

                    {item.idealAnswer && (
                      <div className="ideal-answer-section">

                        <span>
                          IDEAL ANSWER
                        </span>

                        <p>
                          {item.idealAnswer}
                        </p>

                      </div>
                    )}

                  </div>
                );
              }
            )

          )}

        </div>


        {/* ==================================
            BOTTOM BUTTONS
        =================================== */}

        <div className="details-bottom">

          <button
            className="back-history-btn"
            onClick={() =>
              navigate(
                "/interview-history"
              )
            }
          >
            ← Back to Interview History
          </button>


          <button
            className="dashboard-details-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Go to Dashboard →
          </button>

        </div>

      </div>

    </div>
  );
}

export default InterviewDetails;