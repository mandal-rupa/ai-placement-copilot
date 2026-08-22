import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [user, setUser] = useState(null);

  const [latestInterview, setLatestInterview] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [interviewLoading, setInterviewLoading] =
    useState(true);

  // NEW: Dynamic readiness data
  const [readinessData, setReadinessData] = useState({
    resume: 0,
    skillMatch: 0,
    learning: 0,
    interview: 0,
    overall: 0,
  });


  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
  fetchDashboardData();
}, []);

  // ==========================================
  // CALCULATE PLACEMENT READINESS
  // ==========================================

  const calculateReadiness = (interviewData) => {

    // ========================================
    // 1. RESUME SCORE
    // ========================================

    let resumeScore = 0;

    const savedResume =
      localStorage.getItem("resumeAnalysis");

    if (savedResume) {
      try {

        const resume =
          JSON.parse(savedResume);

        resumeScore =
          Number(resume.readinessScore) || 0;

      } catch (error) {

        console.error(
          "Resume calculation error:",
          error
        );

      }
    }


    // ========================================
    // 2. SKILL MATCH
    // ========================================

    const requiredSkills = [
      "javascript",
      "react",
      "node.js",
      "express",
      "mongodb",
      "git",
      "github",
      "html",
      "css",
      "sql",
      "typescript",
      "rest api",
      "docker",
    ];


    let skillMatch = 0;


    if (savedResume) {

      try {

        const resume =
          JSON.parse(savedResume);

        const currentSkills =
          Array.isArray(resume.skills)
            ? resume.skills
            : [];


        const matchedSkills =
          requiredSkills.filter(
            (requiredSkill) =>
              currentSkills.some(
                (currentSkill) =>
                  currentSkill
                    .toLowerCase()
                    .trim() ===
                  requiredSkill
                    .toLowerCase()
                    .trim()
              )
          );


        skillMatch =
          Math.round(
            (matchedSkills.length /
              requiredSkills.length) *
              100
          );

      } catch (error) {

        console.error(
          "Skill calculation error:",
          error
        );

      }

    }


    // ========================================
    // 3. LEARNING PROGRESS
    // ========================================

    const learningModules = {
      typescript: 3,
      "rest-api": 3,
      docker: 3,
    };


    let completedTopics = 0;

    let totalTopics = 0;


    Object.entries(
      learningModules
    ).forEach(
      ([module, topicCount]) => {

        totalTopics += topicCount;


        const saved =
          localStorage.getItem(
            `completed-${module}`
          );


        if (saved) {

          try {

            const completed =
              JSON.parse(saved);

            completedTopics +=
              completed.length;

          } catch (error) {

            console.error(
              "Learning progress error:",
              error
            );

          }

        }

      }
    );


    const learningScore =
      totalTopics > 0
        ? Math.round(
            (completedTopics /
              totalTopics) *
              100
          )
        : 0;


    // ========================================
    // 4. INTERVIEW SCORE
    // ========================================

    let interviewScore = 0;


    if (interviewData) {

      const totalQuestions =
        Number(
          interviewData.totalQuestions
        ) ||
        interviewData.questions?.length ||
        0;


      const overallScore =
        Number(
          interviewData.overallScore
        ) || 0;


      if (totalQuestions > 0) {

        interviewScore =
          Math.round(
            (overallScore /
              (totalQuestions * 10)) *
              100
          );

      }

    }


    // ========================================
    // 5. FINAL READINESS SCORE
    // ========================================

    const overall =
      Math.round(
        resumeScore * 0.30 +
        skillMatch * 0.25 +
        learningScore * 0.20 +
        interviewScore * 0.25
      );


    // ========================================
    // SAVE RESULTS TO STATE
    // ========================================

    setReadinessData({
      resume: resumeScore,
      skillMatch: skillMatch,
      learning: learningScore,
      interview: interviewScore,
      overall: overall,
    });

  };


  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboardData = async () => {

    const token =
      localStorage.getItem("token");


    if (!token) {

      navigate("/login");

      return;

    }


    const config = {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    };


    try {

      // ========================================
      // GET CURRENT USER
      // ========================================

      try {

        const userResponse =
          await axios.get(
            "http://localhost:5000/api/auth/me",
            config
          );


        const currentUser =
          userResponse.data.user;


        console.log(
          "Dashboard User:",
          currentUser
        );


        setUser(currentUser);


        localStorage.setItem(
          "user",
          JSON.stringify(
            currentUser
          )
        );

      } catch (userError) {

        console.error(
          "Could not fetch /me:",
          userError
        );


        const storedUser =
          localStorage.getItem(
            "user"
          );


        if (storedUser) {

          setUser(
            JSON.parse(
              storedUser
            )
          );

        }

      }


      setLoading(false);


      // ========================================
      // GET INTERVIEW HISTORY
      // ========================================

      try {

        const interviewResponse =
          await axios.get(
            "http://localhost:5000/api/interview/history",
            config
          );


        console.log(
          "Interview History:",
          interviewResponse.data
        );


        const interviews =
          interviewResponse.data
            .interviews || [];


        if (interviews.length > 0) {

          // Latest interview
          const latest =
            interviews[0];


          setLatestInterview(
            latest
          );


          // Calculate readiness
          calculateReadiness(
            latest
          );

        } else {

          setLatestInterview(
            null
          );


          // Calculate readiness
          // without interview
          calculateReadiness(
            null
          );

        }

      } catch (interviewError) {

        console.error(
          "Interview history error:",
          interviewError
        );


        setLatestInterview(
          null
        );


        calculateReadiness(
          null
        );

      }


      setInterviewLoading(
        false
      );

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );


      if (
        error.response?.status === 401 ||
        error.response?.status === 403
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


      setLoading(false);

      setInterviewLoading(
        false
      );

    }

  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");

  };


  // ==========================================
  // INTERVIEW SCORE
  // ==========================================

  const getInterviewPercentage = () => {

    if (!latestInterview) {
      return 0;
    }


    const totalQuestions =
      Number(
        latestInterview.totalQuestions
      ) ||
      latestInterview.questions?.length ||
      0;


    const overallScore =
      Number(
        latestInterview.overallScore
      ) || 0;


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
  // PERFORMANCE LABEL
  // ==========================================

  const getPerformanceLabel = (
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

    return "Needs Practice";

  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "Date unavailable";
    }


    const parsedDate =
      new Date(date);


    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {

      return "Date unavailable";

    }


    return parsedDate.toLocaleDateString(
      "en-GB",
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

      <div className="dashboard-page">

        <div className="dashboard-loading">

          Loading dashboard...

        </div>

      </div>

    );

  }


  const interviewPercentage =
    getInterviewPercentage();


  const performance =
    getPerformanceLabel(
      interviewPercentage
    );


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="dashboard-page">


      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="dashboard-nav">

        <div className="auth-logo">

          ✦ AI Placement Copilot

        </div>


        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          Logout

        </button>

      </nav>


      <main className="dashboard-main">


        {/* ====================================
            WELCOME
        ==================================== */}

        <section className="dashboard-welcome">


          <div className="welcome-content">

            <span className="dashboard-label">

              STUDENT DASHBOARD

            </span>


            <h1>

              Welcome back,{" "}

              {user?.name ||
                "Student"} 👋

            </h1>


            <p>

              Let's work toward your
              placement readiness.

            </p>

          </div>


          {/* READINESS */}

          <div className="readiness-card">

            <span>

              PLACEMENT READINESS

            </span>


            <strong>

              {readinessData.overall}%

            </strong>


            <small>

              Current Score

            </small>

          </div>


        </section>


        {/* ====================================
            READINESS BREAKDOWN
        ==================================== */}

        <section className="readiness-overview">


          <div className="section-heading">

            <div>

              <span className="dashboard-label">

                READINESS BREAKDOWN

              </span>


              <h2>

                Your preparation progress

              </h2>

            </div>

          </div>


          <div className="readiness-grid">


            {/* RESUME */}

            <div className="readiness-item">

              <div className="readiness-item-top">

                <span>
                  Resume
                </span>

                <strong>
                  {readinessData.resume}%
                </strong>

              </div>


              <div className="readiness-track">

                <div
                  className="readiness-fill"
                  style={{
                    width:
                      `${readinessData.resume}%`,
                  }}
                />

              </div>

            </div>


            {/* SKILL MATCH */}

            <div className="readiness-item">

              <div className="readiness-item-top">

                <span>
                  Skill Match
                </span>

                <strong>
                  {readinessData.skillMatch}%
                </strong>

              </div>


              <div className="readiness-track">

                <div
                  className="readiness-fill"
                  style={{
                    width:
                      `${readinessData.skillMatch}%`,
                  }}
                />

              </div>

            </div>


            {/* LEARNING */}

            <div className="readiness-item">

              <div className="readiness-item-top">

                <span>
                  Learning
                </span>

                <strong>
                  {readinessData.learning}%
                </strong>

              </div>


              <div className="readiness-track">

                <div
                  className="readiness-fill"
                  style={{
                    width:
                      `${readinessData.learning}%`,
                  }}
                />

              </div>

            </div>


            {/* INTERVIEW */}

            <div className="readiness-item">

              <div className="readiness-item-top">

                <span>
                  Interview
                </span>

                <strong>
                  {readinessData.interview}%
                </strong>

              </div>


              <div className="readiness-track">

                <div
                  className="readiness-fill"
                  style={{
                    width:
                      `${readinessData.interview}%`,
                  }}
                />

              </div>

            </div>


          </div>

        </section>


        {/* ====================================
            LATEST INTERVIEW
        ==================================== */}

        <section className="latest-interview-section">


          <div className="section-heading">


            <div>

              <span className="dashboard-label">

                RECENT PERFORMANCE

              </span>


              <h2>

                Latest Interview

              </h2>

            </div>


            <button
              className="history-link-btn"
              onClick={() =>
                navigate(
                  "/interview-history"
                )
              }
            >

              View All →

            </button>

            <button
  className="job-matching-dashboard-btn"
  onClick={() => navigate("/job-matching")}
>
  AI Job Matching →
</button>


          </div>


          {/* LOADING */}

          {interviewLoading && (

            <div className="latest-interview-card">

              <div className="latest-interview-loading">

                Loading latest interview...

              </div>

            </div>

          )}


          {/* LATEST INTERVIEW */}

          {!interviewLoading &&
            latestInterview && (

            <div className="latest-interview-card">


              {/* INFO */}

              <div className="latest-interview-info">


                <span className="interview-label">

                  INTERVIEW

                </span>


                <h3>

                  {latestInterview.role ||
                    "Software Developer"}

                </h3>


                <p>

                  Completed on{" "}

                  {formatDate(
                    latestInterview.createdAt
                  )}

                </p>


                <div className="latest-interview-meta">


                  <div>

                    <span>
                      DIFFICULTY
                    </span>


                    <strong>

                      {latestInterview.difficulty ||
                        "Medium"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      QUESTIONS
                    </span>


                    <strong>

                      {latestInterview.totalQuestions ||
                        latestInterview.questions
                          ?.length ||
                        0}

                    </strong>

                  </div>


                </div>

              </div>


              {/* SCORE */}

              <div className="latest-interview-score">

                <span>
                  SCORE
                </span>


                <strong>

                  {interviewPercentage}%

                </strong>


                <small>

                  {performance}

                </small>

              </div>


              {/* VIEW DETAILS */}

              <div className="latest-interview-action">

                <Link
                  to={`/interview-details/${
                    latestInterview._id ||
                    latestInterview.id
                  }`}
                  className="view-details-link"
                >

                  View Details →

                </Link>

              </div>


            </div>

          )}


          {/* EMPTY */}

          {!interviewLoading &&
            !latestInterview && (

            <div className="latest-interview-card empty">

              <div className="latest-interview-empty">


                <div className="empty-icon">
                  ◷
                </div>


                <div>

                  <h3>
                    No interviews yet
                  </h3>


                  <p>

                    Complete your first mock
                    interview to see your
                    performance here.

                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/mock-interview"
                    )
                  }
                >

                  Start Interview →

                </button>


              </div>

            </div>

          )}

        </section>


        {/* ====================================
            FEATURE CARDS
        ==================================== */}

        <section className="dashboard-grid">


          {/* RESUME */}

          <div className="dashboard-card">

            <div className="card-icon">
              ⌕
            </div>


            <h3>
              Resume Analyzer
            </h3>


            <p>

              Upload your resume and discover
              your strengths and skill gaps.

            </p>


            <button
              onClick={() =>
                navigate(
                  "/resume"
                )
              }
            >

              Analyze Resume →

            </button>

          </div>


          {/* SKILL GAP */}

          <div className="dashboard-card">

            <div className="card-icon">
              ◈
            </div>


            <h3>
              Skill Gap
            </h3>


            <p>

              Understand which skills you
              need for your target role.

            </p>


            <button
              onClick={() =>
                navigate(
                  "/skill-gap"
                )
              }
            >

              View Skill Gaps →

            </button>

          </div>


          {/* ROADMAP */}

          <div className="dashboard-card">

            <div className="card-icon">
              ◎
            </div>


            <h3>
              Learning Roadmap
            </h3>


            <p>

              Follow an AI-generated roadmap
              based on your preparation needs.

            </p>


            <button
              onClick={() =>
                navigate(
                  "/roadmap"
                )
              }
            >

              Open Roadmap →

            </button>

          </div>


          {/* MOCK INTERVIEW */}

          <div className="dashboard-card">

            <div className="card-icon">
              ◉
            </div>


            <h3>
              Mock Interview
            </h3>


            <p>

              Practice role-specific questions
              and receive AI feedback.

            </p>


            <button
              onClick={() =>
                navigate(
                  "/mock-interview"
                )
              }
            >

              Start Interview →

            </button>

          </div>


          {/* INTERVIEW HISTORY */}

          <div className="dashboard-card">

            <div className="card-icon">
              ◷
            </div>


            <h3>
              Interview History
            </h3>


            <p>

              Review your previous mock
              interview performances and
              track your progress.

            </p>


            <button
              onClick={() =>
                navigate(
                  "/interview-history"
                )
              }
            >

              View History →

            </button>

          </div>


        </section>


      </main>

    </div>

  );

}

export default Dashboard;