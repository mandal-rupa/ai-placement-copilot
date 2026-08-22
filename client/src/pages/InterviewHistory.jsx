import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./InterviewHistory.css";

function InterviewHistory() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH INTERVIEW HISTORY
  // ==========================================

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/interview/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Interview history:",
        response.data
      );

      setInterviews(
        response.data.interviews || []
      );
    } catch (err) {
      console.error(
        "History error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load interview history."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SCORE PERCENTAGE
  // ==========================================

  const getScorePercentage = (interview) => {
    const totalQuestions =
      Number(interview.totalQuestions) ||
      interview.questions?.length ||
      0;

    const overallScore =
      Number(interview.overallScore) || 0;

    if (totalQuestions === 0) {
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

  const getScoreLabel = (percentage) => {
    if (percentage >= 80) {
      return "Excellent";
    }

    if (percentage >= 60) {
      return "Good";
    }

    if (percentage >= 40) {
      return "Needs Improvement";
    }

    return "Poor";
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "Date unavailable";
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
      <div className="history-page">
        <div className="history-container">

          <p>
            Loading interview history...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="history-page">

      <div className="history-container">

        {/* ==========================================
            BACK TO DASHBOARD
        ========================================== */}

        <button
          className="back-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>


        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="history-heading">

          <span>
            AI MOCK INTERVIEW
          </span>

          <h1>
            Interview History
          </h1>

          <p>
            Review your previous mock
            interview performances.
          </p>

        </div>


        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div className="history-error">
            {error}
          </div>
        )}


        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {!error &&
          interviews.length === 0 && (

          <div className="history-empty">

            <div className="empty-icon">
              ✦
            </div>

            <h2>
              No interviews yet
            </h2>

            <p>
              Complete your first mock
              interview to see it here.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/mock-interview"
                )
              }
            >
              Start Mock Interview →
            </button>

          </div>
        )}


        {/* ==========================================
            INTERVIEW LIST
        ========================================== */}

        <div className="history-list">

          {interviews.map(
            (interview) => {

              const percentage =
                getScorePercentage(
                  interview
                );

              return (
                <div
                  className="history-card"
                  key={interview._id}
                >

                  {/* ==================================
                      CARD TOP
                  ================================== */}

                  <div className="history-card-top">

                    <div>

                      <span className="history-label">
                        INTERVIEW
                      </span>

                      <h2>
                        {interview.role ||
                          "Interview"}
                      </h2>

                    </div>


                    {/* SCORE */}

                    <div className="history-score">

                      <strong>
                        {percentage}%
                      </strong>

                      <span>
                        {getScoreLabel(
                          percentage
                        )}
                      </span>

                    </div>

                  </div>


                  {/* ==================================
                      DETAILS
                  ================================== */}

                  <div className="history-details">

                    {/* DIFFICULTY */}

                    <div>

                      <span>
                        DIFFICULTY
                      </span>

                      <strong>
                        {interview.difficulty ||
                          "Medium"}
                      </strong>

                    </div>


                    {/* QUESTIONS */}

                    <div>

                      <span>
                        QUESTIONS
                      </span>

                      <strong>
                        {interview.totalQuestions ||
                          interview.questions?.length ||
                          0}
                      </strong>

                    </div>


                    {/* DATE */}

                    <div>

                      <span>
                        DATE
                      </span>

                      <strong>
                        {formatDate(
                          interview.createdAt
                        )}
                      </strong>

                    </div>


                    {/* ==================================
                        VIEW DETAILS
                    ================================== */}

                    <div className="history-card-action">

                      <button
                        type="button"
                        className="view-details-btn"
                        onClick={() =>
                          navigate(
                            `/interview-details/${interview._id}`
                          )
                        }
                      >
                        View Details →
                      </button>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}

export default InterviewHistory;