import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SkillGap.css";

function SkillGap() {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);

  // ==========================================
  // LOAD RESUME ANALYSIS
  // ==========================================

  useEffect(() => {
    try {
      const savedAnalysis =
        localStorage.getItem("resumeAnalysis");

      if (savedAnalysis) {
        const parsedAnalysis =
          JSON.parse(savedAnalysis);

        setAnalysis(parsedAnalysis);
      }
    } catch (error) {
      console.error(
        "Failed to load resume analysis:",
        error
      );

      localStorage.removeItem(
        "resumeAnalysis"
      );
    }
  }, []);

  // ==========================================
  // NORMALIZE SKILL
  // ==========================================

  const normalizeSkill = (skill) => {
    return String(skill || "")
      .trim()
      .toLowerCase();
  };

  // ==========================================
  // CURRENT SKILLS
  // ==========================================

  const currentSkills =
    Array.isArray(analysis?.skills)
      ? analysis.skills
      : [];

  // ==========================================
  // SKILL GAPS FROM RESUME ANALYSIS
  // ==========================================

  const missingSkills =
    Array.isArray(analysis?.skillGaps)
      ? analysis.skillGaps
      : [];

  // ==========================================
  // MATCHED SKILLS
  // ==========================================

  const matchedSkills =
    currentSkills.filter(
      (skill, index, array) =>
        array.findIndex(
          (item) =>
            normalizeSkill(item) ===
            normalizeSkill(skill)
        ) === index
    );

  // ==========================================
  // SKILL MATCH %
  // ==========================================

  const totalSkills =
    matchedSkills.length +
    missingSkills.length;

  const matchPercentage =
    totalSkills > 0
      ? Math.round(
          (matchedSkills.length /
            totalSkills) *
            100
        )
      : analysis?.readinessScore || 0;

  // ==========================================
  // PRIORITY SKILLS
  // ==========================================

  const prioritySkills =
    missingSkills.slice(0, 3);

  // ==========================================
  // NO ANALYSIS
  // ==========================================

  if (!analysis) {
    return (
      <div className="skill-gap-page">

        <div className="skill-gap-container">

          <button
            type="button"
            className="back-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <div className="skill-gap-heading">

            <span>
              AI SKILL GAP ANALYSIS
            </span>

            <h1>
              Know what you need
              <br />
              <strong>
                to become placement ready.
              </strong>
            </h1>

            <p>
              Compare your current skills with
              the skills required for your target role.
            </p>

          </div>

          <div className="skill-gap-empty">

            <div className="empty-icon">
              ◈
            </div>

            <h2>
              Resume analysis required
            </h2>

            <p>
              Analyze your resume first to generate
              your personalized skill gap analysis.
            </p>

            <button
              type="button"
              className="auth-submit"
              onClick={() =>
                navigate("/resume")
              }
            >
              Analyze Resume →
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="skill-gap-page">

      <div className="skill-gap-container">

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
            HEADER
        ================================== */}

        <div className="skill-gap-heading">

          <span>
            AI SKILL GAP ANALYSIS
          </span>

          <h1>
            Know what you need
            <br />
            <strong>
              to become placement ready.
            </strong>
          </h1>

          <p>
            Compare your current skills with
            the skills required for your target role.
          </p>

        </div>


        {/* ==================================
            OVERVIEW
        ================================== */}

        <div className="gap-overview">

          <div className="gap-card">

            <span>
              TARGET ROLE
            </span>

            <h2>
              {analysis.targetRole ||
                "Software Developer"}
            </h2>

          </div>


          <div className="gap-card">

            <span>
              SKILL MATCH
            </span>

            <h2>
              {matchPercentage}%
            </h2>

          </div>


          <div className="gap-card">

            <span>
              MISSING SKILLS
            </span>

            <h2>
              {missingSkills.length}
            </h2>

          </div>

        </div>


        {/* ==================================
            YOUR STRENGTHS
        ================================== */}

        <div className="skill-section">

          <div className="section-title">

            <span>
              ✓
            </span>

            <div>

              <h2>
                Your Strengths
              </h2>

              <p>
                Skills detected in your resume.
              </p>

            </div>

          </div>


          <div className="skill-list">

            {matchedSkills.length > 0 ? (

              matchedSkills.map(
                (skill, index) => (

                  <span
                    key={`${skill}-${index}`}
                  >
                    ✓ {skill}
                  </span>

                )
              )

            ) : (

              <p>
                No skills detected yet.
              </p>

            )}

          </div>

        </div>


        {/* ==================================
            SKILLS TO LEARN
        ================================== */}

        <div className="skill-section">

          <div className="section-title">

            <span>
              +
            </span>

            <div>

              <h2>
                Skills To Learn
              </h2>

              <p>
                These skills can improve your
                placement readiness.
              </p>

            </div>

          </div>


          <div className="skill-list gap-list">

            {missingSkills.length > 0 ? (

              missingSkills.map(
                (skill, index) => (

                  <span
                    key={`${skill}-${index}`}
                  >
                    + {skill}
                  </span>

                )
              )

            ) : (

              <p>
                Excellent! No major skill gaps detected.
              </p>

            )}

          </div>

        </div>


        {/* ==================================
            AI PRIORITY
        ================================== */}

        <div className="priority-card">

          <span>
            ✦ AI PRIORITY
          </span>

          <h2>
            Focus on your highest-impact
            skills first.
          </h2>


          {prioritySkills.length > 0 ? (

            <p>
              Your next learning priorities should be{" "}
              <strong>
                {prioritySkills.join(", ")}
              </strong>
              .
            </p>

          ) : (

            <p>
              Your current skill profile already
              covers the major requirements for
              your target role.
            </p>

          )}

        </div>


        {/* ==================================
            ACTION BUTTONS
        ================================== */}

        <div className="skill-gap-actions">

          <button
            type="button"
            className="primary-action-btn"
            onClick={() =>
              navigate("/roadmap")
            }
          >
            Build My Learning Roadmap →
          </button>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={() =>
              navigate("/resume")
            }
          >
            Re-analyze Resume
          </button>

        </div>

      </div>

    </div>
  );
}

export default SkillGap;