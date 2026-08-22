import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import LearningModule from "./pages/LearningModule";
import MockInterview from "./pages/MockInterview";
import InterviewHistory from "./pages/InterviewHistory";
import InterviewDetails from "./pages/InterviewDetails";
import JobMatching from "./pages/JobMatching";

function Landing() {
  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">

          <div className="logo-icon">
            ✦
          </div>

          <span>
            AI Placement Copilot
          </span>

        </div>

        <div className="nav-links">

          <a href="#features">
            Features
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

        </div>

        <div className="nav-actions">

          <Link
            to="/login"
            className="login-btn"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="nav-cta"
          >
            Get Started
          </Link>

        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-content">

          <div className="badge">
            ✦ AI-Powered Placement Preparation
          </div>

          <h1>

            From Skill Gaps
            <br />

            <span>
              to Placement Ready.
            </span>

          </h1>

          <p>

            Your intelligent placement companion that analyzes
            your resume, identifies skill gaps, builds a
            personalized roadmap and prepares you for real
            interviews.

          </p>

          <div className="hero-buttons">

            <Link
              to="/register"
              className="primary-btn"
            >
              Start Your Journey →
            </Link>

            <a
              href="#features"
              className="secondary-btn"
            >
              Explore Features
            </a>

          </div>

        </div>


        {/* ================= HERO PREVIEW ================= */}

        <div className="hero-preview">

          <div className="glow"></div>

          <div className="dashboard-window">

            <div className="window-header">
              ✦ Placement Dashboard
            </div>

            <div className="dashboard-body">

              <div className="dashboard-top">

                <div>

                  <small>
                    AI Placement Copilot
                  </small>

                  <h3>
                    Your readiness journey
                  </h3>

                </div>

                <div className="score-circle">

                  <strong>
                    74%
                  </strong>

                  <span>
                    Ready
                  </span>

                </div>

              </div>


              <div className="mini-cards">

                <div className="mini-card">

                  <span>
                    Skill Match
                  </span>

                  <strong>
                    68%
                  </strong>

                </div>

                <div className="mini-card">

                  <span>
                    Roadmap
                  </span>

                  <strong>
                    12/20
                  </strong>

                </div>

                <div className="mini-card">

                  <span>
                    Job Matches
                  </span>

                  <strong>
                    08
                  </strong>

                </div>

              </div>


              <div className="recommendation">

                ✦ AI Recommendation

                <br />

                Focus on your highest-priority skill gaps next.

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section
        className="features"
        id="features"
      >

        <div className="section-heading">

          <div className="badge">
            ✦ Everything You Need
          </div>

          <h2>

            Your complete placement{" "}

            <span>
              copilot.
            </span>

          </h2>

          <p>
            One intelligent platform for your placement
            preparation journey.
          </p>

        </div>


        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-icon">
              ⌕
            </div>

            <h3>
              AI Resume Analyzer
            </h3>

            <p>
              Analyze your resume and discover strengths and
              missing skills.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ◈
            </div>

            <h3>
              Skill Gap Analysis
            </h3>

            <p>
              Identify the skills required for your target
              placement role.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ◎
            </div>

            <h3>
              Personalized Roadmap
            </h3>

            <p>
              Get a learning path based on your individual
              skill gaps.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ↗
            </div>

            <h3>
              AI Job Matching
            </h3>

            <p>
              Find opportunities aligned with your skills and
              target role.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ◉
            </div>

            <h3>
              Mock Interviews
            </h3>

            <p>
              Practice interviews and receive actionable AI
              feedback.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ↻
            </div>

            <h3>
              Readiness Score
            </h3>

            <p>
              Track your progress as you learn and practice.
            </p>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="cta-section">

        <div className="cta-box">

          <div className="badge">
            ✦ Start Your Placement Journey
          </div>

          <h2>

            Become{" "}

            <span>
              placement ready.
            </span>

          </h2>

          <p>
            Analyze. Learn. Practice. Evaluate. Apply.
          </p>

          <Link
            to="/register"
            className="primary-btn"
          >
            Get Started →
          </Link>

        </div>

      </section>

    </div>
  );
}


/* ==================================================
   APP ROUTES
================================================== */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ================= LANDING ================= */}

        <Route
          path="/"
          element={<Landing />}
        />


        {/* ================= AUTH ================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ================= DASHBOARD ================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ================= RESUME ================= */}

        <Route
          path="/resume"
          element={<ResumeAnalyzer />}
        />


        {/* ================= SKILL GAP ================= */}

        <Route
          path="/skill-gap"
          element={<SkillGap />}
        />


        {/* ================= ROADMAP ================= */}

        <Route
          path="/roadmap"
          element={<Roadmap />}
        />


        {/* ================= LEARNING ================= */}

        <Route
          path="/learn/:module"
          element={<LearningModule />}
        />


        {/* ================= MOCK INTERVIEW ================= */}

        <Route
          path="/mock-interview"
          element={<MockInterview />}
        />


        {/* ================= INTERVIEW HISTORY ================= */}

        <Route
          path="/interview-history"
          element={<InterviewHistory />}
        />


        {/* ================= INTERVIEW DETAILS ================= */}

       <Route
  path="/interview-details/:id"
  element={<InterviewDetails />}
/>

        <Route
  path="/job-matching"
  element={<JobMatching />}
/>
       
      </Routes>

    </BrowserRouter>

  );
}

export default App;