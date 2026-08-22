import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Resume.css";

function Resume() {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [file, setFile] = useState(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [analysis, setAnalysis] =
    useState(null);

  // ==========================================
  // HANDLE FILE
  // ==========================================

  const handleFile = (selectedFile) => {
    setError("");

    if (!selectedFile) {
      return;
    }

    // PDF ONLY
    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setError(
        "Please upload a PDF file only."
      );

      return;
    }

    // 5 MB LIMIT
    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setError(
        "File size must be less than 5 MB."
      );

      return;
    }

    setFile(selectedFile);

    // Clear previous result
    setAnalysis(null);
  };

  // ==========================================
  // FILE INPUT
  // ==========================================

  const handleInputChange = (e) => {
    const selectedFile =
      e.target.files[0];

    handleFile(selectedFile);
  };

  // ==========================================
  // DRAG OVER
  // ==========================================

  const handleDragOver = (e) => {
    e.preventDefault();

    setDragActive(true);
  };

  // ==========================================
  // DRAG LEAVE
  // ==========================================

  const handleDragLeave = (e) => {
    e.preventDefault();

    setDragActive(false);
  };

  // ==========================================
  // DROP
  // ==========================================

  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    const droppedFile =
      e.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  // ==========================================
  // REMOVE FILE
  // ==========================================

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
    setError("");
  };

  // ==========================================
  // ANALYZE RESUME
  // ==========================================

  const handleAnalyze = async () => {
    if (!file) {
      setError(
        "Please upload your resume first."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      // ==========================================
      // TOKEN
      // ==========================================

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        navigate("/login");

        return;
      }

      // ==========================================
      // FORM DATA
      // ==========================================

      const formData =
        new FormData();

      /*
        IMPORTANT:

        Backend route uses:

        upload.single("resume")

        Therefore the field name MUST be:
        "resume"
      */

      formData.append(
        "resume",
        file
      );

      console.log(
        "Uploading resume:",
        file.name
      );

      // ==========================================
      // API REQUEST
      // ==========================================

      const response =
        await axios.post(
          "http://localhost:5000/api/resume/analyze",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "Resume analysis response:",
        response.data
      );

      // ==========================================
      // SAVE ANALYSIS
      // ==========================================

      if (
        response.data &&
        response.data.analysis
      ) {
        setAnalysis(
          response.data.analysis
        );
      } else {
        throw new Error(
          "Invalid response received from server."
        );
      }

    } catch (err) {
      console.error(
        "Resume analysis error:",
        err
      );

      // ==========================================
      // ERROR MESSAGE
      // ==========================================

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        navigate("/login");

        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Resume analysis failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

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

    return "Needs Attention";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="resume-page">

      {/* ======================================
          BACK BUTTON
      ====================================== */}

      <button
        className="resume-back-btn"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        ← Dashboard
      </button>

      <div className="resume-container">

        {/* ====================================
            HEADER
        ==================================== */}

        <div className="resume-heading">

          <span className="resume-label">
            AI RESUME ANALYZER
          </span>

          <h1>
            Analyze Your Resume
          </h1>

          <p>
            Upload your resume and discover
            your skills, strengths and areas
            for improvement.
          </p>

        </div>

        {/* ====================================
            UPLOAD CARD
        ==================================== */}

        {!analysis && (
          <div className="resume-card">

            <div className="resume-card-heading">

              <h2>
                Upload Your Resume
              </h2>

              <p>
                Upload your latest resume in
                PDF format.
              </p>

            </div>

            {/* ==================================
                DROP ZONE
            ================================== */}

            <label
              className={`resume-dropzone ${
                dragActive
                  ? "drag-active"
                  : ""
              }`}
              onDragOver={
                handleDragOver
              }
              onDragLeave={
                handleDragLeave
              }
              onDrop={
                handleDrop
              }
            >

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={
                  handleInputChange
                }
                hidden
                disabled={loading}
              />

              <div className="upload-icon">
                ↑
              </div>

              <h3>
                Drop your resume here
              </h3>

              <p>
                or click to browse from your
                computer
              </p>

              <span>
                PDF only · Maximum 5 MB
              </span>

            </label>

            {/* ==================================
                ERROR
            ================================== */}

            {error && (
              <div className="resume-error">
                {error}
              </div>
            )}

            {/* ==================================
                SELECTED FILE
            ================================== */}

            {file && (
              <div className="selected-file">

                <div className="file-icon">
                  PDF
                </div>

                <div className="file-info">

                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </span>

                </div>

                <button
                  type="button"
                  onClick={
                    removeFile
                  }
                  className="remove-file-btn"
                  disabled={loading}
                >
                  Remove
                </button>

              </div>
            )}

            {/* ==================================
                ANALYZE BUTTON
            ================================== */}

            <button
              className="analyze-resume-btn"
              onClick={
                handleAnalyze
              }
              disabled={
                !file ||
                loading
              }
            >

              {loading
                ? "Analyzing Resume..."
                : "Analyze Resume →"}

            </button>

          </div>
        )}

        {/* ====================================
            ANALYSIS RESULT
        ==================================== */}

        {analysis && (
          <div className="resume-results">

            {/* ==================================
                RESULT HEADER
            ================================== */}

            <div className="resume-result-header">

              <div>

                <span className="resume-label">
                  ANALYSIS COMPLETE
                </span>

                <h2>
                  Resume Analysis
                </h2>

                <p>
                  {analysis.fileName}
                </p>

              </div>

              <div className="resume-score">

                <span>
                  RESUME SCORE
                </span>

                <strong>
                  {Number(
                    analysis.readinessScore ||
                      0
                  )}%
                </strong>

                <small>
                  {getScoreLabel(
                    Number(
                      analysis.readinessScore ||
                        0
                    )
                  )}
                </small>

              </div>

            </div>

            {/* ==================================
                TARGET ROLE
            ================================== */}

            <div className="analysis-info-card">

              <span>
                TARGET ROLE
              </span>

              <strong>
                {analysis.targetRole ||
                  "Software Developer"}
              </strong>

            </div>

            {/* ==================================
                SKILLS
            ================================== */}

            <div className="analysis-section">

              <div className="analysis-section-header">

                <div className="analysis-icon">
                  ◈
                </div>

                <div>

                  <h3>
                    Skills Found
                  </h3>

                  <p>
                    Skills detected from
                    your resume.
                  </p>

                </div>

              </div>

              {Array.isArray(
                analysis.skills
              ) &&
              analysis.skills.length > 0 ? (

                <div className="skill-list">

                  {analysis.skills.map(
                    (
                      skill,
                      index
                    ) => (

                      <span
                        className="skill-tag"
                        key={`${skill}-${index}`}
                      >
                        ✓ {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p className="no-data">
                  No matching skills were
                  detected.
                </p>

              )}

            </div>

            {/* ==================================
                SKILL GAPS
            ================================== */}

            <div className="analysis-section">

              <div className="analysis-section-header">

                <div className="analysis-icon">
                  ◇
                </div>

                <div>

                  <h3>
                    Skill Gaps
                  </h3>

                  <p>
                    Skills recommended for
                    your target role.
                  </p>

                </div>

              </div>

              {Array.isArray(
                analysis.skillGaps
              ) &&
              analysis.skillGaps.length > 0 ? (

                <div className="skill-list gap-list">

                  {analysis.skillGaps.map(
                    (
                      skill,
                      index
                    ) => (

                      <span
                        className="gap-tag"
                        key={`${skill}-${index}`}
                      >
                        + {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <div className="no-gap-message">
                  <strong>
                    Great job! 🎉
                  </strong>

                  <p>
                    No major skill gaps were
                    detected for this role.
                  </p>
                </div>

              )}

            </div>

            {/* ==================================
                READINESS
            ================================== */}

            <div className="readiness-result-card">

              <div>

                <span>
                  PLACEMENT READINESS
                </span>

                <h3>
                  {
                    Number(
                      analysis.readinessScore ||
                        0
                    )
                  }%
                </h3>

              </div>

              <div className="readiness-progress">

                <div
                  className="readiness-progress-bar"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        Number(
                          analysis.readinessScore ||
                            0
                        )
                      )
                    )}%`,
                  }}
                ></div>

              </div>

              <p>
                This score is based on the
                skills detected in your resume
                compared with the required
                skills for your target role.
              </p>

            </div>

            {/* ==================================
                ACTIONS
            ================================== */}

            <div className="resume-result-actions">

              <button
                className="resume-secondary-btn"
                onClick={() => {
                  setAnalysis(null);
                  setFile(null);
                  setError("");
                }}
              >
                Analyze Another Resume
              </button>

              <button
                className="resume-primary-btn"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                Back to Dashboard →
              </button>

            </div>

          </div>
        )}

        {/* ====================================
            FEATURES
        ==================================== */}

        {!analysis && (
          <div className="resume-features">

            <div className="resume-feature">

              <div className="feature-icon">
                ◈
              </div>

              <h3>
                Resume Score
              </h3>

              <p>
                Get a readiness score based
                on your skills and target role.
              </p>

            </div>

            <div className="resume-feature">

              <div className="feature-icon">
                ◎
              </div>

              <h3>
                Skills Detection
              </h3>

              <p>
                Identify technical skills
                present in your resume.
              </p>

            </div>

            <div className="resume-feature">

              <div className="feature-icon">
                ✦
              </div>

              <h3>
                Skill Gap Analysis
              </h3>

              <p>
                Discover which skills you
                should improve for your role.
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default Resume;