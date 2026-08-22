import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ==========================================
  // ANALYZE RESUME
  // ==========================================

  const handleAnalyze = async () => {
    if (!file) {
      setError(
        "Please select your resume PDF first."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Your login session has expired. Please login again."
        );

        setLoading(false);

        return;
      }

      const formData = new FormData();

      formData.append(
        "resume",
        file
      );

      const response =
        await axios.post(
          "http://localhost:5000/api/resume/analyze",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            timeout: 30000,
          }
        );

      console.log(
        "Resume API response:",
        response.data
      );

      const analysis =
        response.data?.analysis ||
        response.data?.data ||
        response.data;

      const finalResult = {
        resumeId:
          analysis?.resumeId ||
          analysis?._id ||
          null,

        targetRole:
          analysis?.targetRole ||
          "Software Developer",

        readinessScore:
          Number(
            analysis?.readinessScore
          ) || 0,

        skills:
          Array.isArray(
            analysis?.skills
          )
            ? analysis.skills
            : [],

        skillGaps:
          Array.isArray(
            analysis?.skillGaps
          )
            ? analysis.skillGaps
            : [],

        fileName:
          analysis?.fileName ||
          file.name,
      };

      console.log(
        "Final resume analysis:",
        finalResult
      );

      setResult(finalResult);

      // ==========================================
      // SAVE ANALYSIS
      // ==========================================

      localStorage.setItem(
        "resumeAnalysis",
        JSON.stringify(finalResult)
      );

      // Also update stored user readiness
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const user =
            JSON.parse(storedUser);

          user.readinessScore =
            finalResult.readinessScore;

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );
        } catch (error) {
          console.error(
            "Could not update stored user:",
            error
          );
        }
      }

    } catch (err) {
      console.error(
        "RESUME ANALYSIS ERROR:",
        err
      );

      if (
        err.code ===
        "ECONNABORTED"
      ) {
        setError(
          "Server took too long to respond. Please try again."
        );
      } else if (err.response) {
        setError(
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the backend server. Make sure the server is running on port 5000."
        );
      } else {
        setError(
          err.message ||
          "Resume analysis failed."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setFile(null);

      setError(
        "Only PDF files are allowed."
      );

      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setFile(null);

      setError(
        "Resume must be smaller than 5 MB."
      );

      return;
    }

    setFile(selectedFile);
  };

  return (
    <div className="resume-page">

      <div className="resume-container">

        {/* ==================================
            BACK
        ================================== */}

        <button
          type="button"
          className="back-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>


        {/* ==================================
            HEADING
        ================================== */}

        <div className="resume-heading">

          <span>
            AI RESUME ANALYZER
          </span>

          <h1>
            Understand your
            <br />
            <strong>
              placement readiness.
            </strong>
          </h1>

          <p>
            Upload your resume and discover
            your skills, missing requirements
            and readiness for your target role.
          </p>

        </div>


        {/* ==================================
            UPLOAD CARD
        ================================== */}

        <div className="upload-card">

          <div className="upload-icon">
            ↑
          </div>

          <h2>
            Upload your resume
          </h2>

          <p>
            PDF format only · Maximum 5 MB
          </p>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={
              handleFileChange
            }
          />


          {/* SELECTED FILE */}

          {file && (
            <div className="selected-file">
              📄 {file.name}
            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          {/* ANALYZE */}

          <button
            type="button"
            className="auth-submit"
            onClick={
              handleAnalyze
            }
            disabled={loading}
          >
            {loading
              ? "Analyzing Resume..."
              : "Analyze Resume →"}
          </button>

        </div>


        {/* ==================================
            LOADING
        ================================== */}

        {loading && (
          <div className="analysis-result">

            <div className="result-section">

              <h3>
                AI is analyzing your resume...
              </h3>

              <p>
                Extracting skills and comparing
                them with your target role.
              </p>

            </div>

          </div>
        )}


        {/* ==================================
            RESULT
        ================================== */}

        {result && !loading && (

          <div className="analysis-result">

            {/* RESULT HEADER */}

            <div className="result-header">

              <div>

                <span>
                  ANALYSIS COMPLETE
                </span>

                <h2>
                  {result.targetRole}
                </h2>

                <p>
                  📄 {result.fileName}
                </p>

              </div>


              {/* SCORE */}

              <div className="result-score">

                <strong>
                  {result.readinessScore}%
                </strong>

                <small>
                  Readiness
                </small>

              </div>

            </div>


            {/* ==================================
                DETECTED SKILLS
            ================================== */}

            <div className="result-section">

              <h3>
                Detected Skills
              </h3>

              {result.skills.length > 0 ? (

                <div className="skill-list">

                  {result.skills.map(
                    (skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                      >
                        ✓ {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p>
                  No recognized skills found
                  in your resume.
                </p>

              )}

            </div>


            {/* ==================================
                SKILL GAPS
            ================================== */}

            <div className="result-section">

              <h3>
                Skill Gaps
              </h3>

              {result.skillGaps.length > 0 ? (

                <div className="skill-list gap-list">

                  {result.skillGaps.map(
                    (skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                      >
                        + {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p>
                  Great! No major skill gaps
                  detected.
                </p>

              )}

            </div>


            {/* ==================================
                RECOMMENDATION
            ================================== */}

            <div className="result-section">

              <h3>
                AI Recommendation
              </h3>

              {result.skillGaps.length > 0 ? (

                <p>
                  Focus on{" "}
                  <strong>
                    {result.skillGaps
                      .slice(0, 3)
                      .join(", ")}
                  </strong>{" "}
                  next. These skills can improve
                  your readiness for the{" "}
                  <strong>
                    {result.targetRole}
                  </strong>{" "}
                  role.
                </p>

              ) : (

                <p>
                  Your resume currently matches
                  the major skills required for
                  your target role. Keep practicing
                  and improving your interview
                  readiness.
                </p>

              )}

            </div>


            {/* ==================================
                NEXT ACTIONS
            ================================== */}

            <div className="resume-next-actions">

              <button
                type="button"
                onClick={() =>
                  navigate("/skill-gap")
                }
              >
                View Skill Gap →
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/roadmap")
                }
              >
                View Learning Roadmap →
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default ResumeAnalyzer;