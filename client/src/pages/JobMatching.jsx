import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JobMatching.css";

function JobMatching() {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("resumeAnalysis");

    if (saved) {
      const parsed = JSON.parse(saved);
      setAnalysis(parsed);
      generateMatches(parsed);
    }
  }, []);

  const jobData = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechNova Solutions",
      location: "Bangalore",
      type: "Full Time",
      skills: ["javascript", "react", "html", "css", "git"],
    },
    {
      id: 2,
      title: "React Developer",
      company: "WebCraft Technologies",
      location: "Hyderabad",
      type: "Full Time",
      skills: ["javascript", "react", "node.js", "git", "github"],
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Innovate Labs",
      location: "Pune",
      type: "Full Time",
      skills: [
        "javascript",
        "react",
        "node.js",
        "express",
        "mongodb",
      ],
    },
    {
      id: 4,
      title: "Software Developer",
      company: "CodeSphere",
      location: "Remote",
      type: "Full Time",
      skills: ["java", "sql", "git", "github"],
    },
    {
      id: 5,
      title: "Web Developer Intern",
      company: "DigitalWorks",
      location: "Kolkata",
      type: "Internship",
      skills: ["html", "css", "javascript", "react"],
    },
    {
      id: 6,
      title: "Backend Developer",
      company: "CloudTech",
      location: "Delhi",
      type: "Full Time",
      skills: ["node.js", "express", "mongodb", "sql"],
    },
  ];

  const generateMatches = (resume) => {
    const currentSkills = (resume?.skills || []).map((skill) =>
      skill.toLowerCase()
    );

    const matchedJobs = jobData.map((job) => {
      const matchedSkills = job.skills.filter((skill) =>
        currentSkills.includes(skill.toLowerCase())
      );

      const percentage = Math.round(
        (matchedSkills.length / job.skills.length) * 100
      );

      return {
        ...job,
        matchPercentage: percentage,
        matchedSkills,
      };
    });

    matchedJobs.sort(
      (a, b) => b.matchPercentage - a.matchPercentage
    );

    setJobs(matchedJobs);
  };

  if (!analysis) {
    return (
      <div className="job-page">
        <div className="job-container">

          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <div className="job-empty">
            <div className="job-empty-icon">↗</div>

            <h1>Job Matching</h1>

            <p>
              Analyze your resume first to discover jobs
              that match your skills.
            </p>

            <button
              onClick={() => navigate("/resume")}
            >
              Analyze Resume →
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="job-page">

      <div className="job-container">

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div className="job-heading">

          <span>AI JOB MATCHING</span>

          <h1>
            Find roles that
            <br />
            <strong>match your skills.</strong>
          </h1>

          <p>
            AI-powered matching based on your resume,
            skills and target role.
          </p>

        </div>

        <div className="job-summary">

          <div>
            <span>TARGET ROLE</span>
            <strong>
              {analysis.targetRole || "Software Developer"}
            </strong>
          </div>

          <div>
            <span>YOUR SKILLS</span>
            <strong>
              {analysis.skills?.length || 0}
            </strong>
          </div>

          <div>
            <span>JOBS FOUND</span>
            <strong>{jobs.length}</strong>
          </div>

        </div>

        <div className="job-section-header">
          <span>✦ AI RECOMMENDATIONS</span>

          <h2>
            Best job matches for you
          </h2>
        </div>

        <div className="job-list">

          {jobs.map((job) => (

            <div
              className="job-card"
              key={job.id}
            >

              <div className="job-card-top">

                <div>

                  <span className="job-type">
                    {job.type}
                  </span>

                  <h2>{job.title}</h2>

                  <p className="company">
                    {job.company}
                  </p>

                  <p className="location">
                    📍 {job.location}
                  </p>

                </div>

                <div className="match-score">

                  <strong>
                    {job.matchPercentage}%
                  </strong>

                  <span>
                    Match
                  </span>

                </div>

              </div>

              <div className="job-divider"></div>

              <div className="job-skills">

                <span className="skills-title">
                  MATCHED SKILLS
                </span>

                <div className="matched-skill-list">

                  {job.matchedSkills.length > 0 ? (
                    job.matchedSkills.map((skill) => (
                      <span key={skill}>
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <span>No direct skill match</span>
                  )}

                </div>

              </div>

              <div className="job-card-bottom">

                <span>
                  {job.matchPercentage >= 80
                    ? "Excellent match"
                    : job.matchPercentage >= 60
                    ? "Good match"
                    : "Skills to improve"}
                </span>

                <button
  onClick={() => {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(
        `${job.title} jobs ${job.location}`
      )}`,
      "_blank"
    );
  }}
>
  View Opportunity →
</button>

              </div>

            </div>

          ))}

        </div>

        <div className="job-guidance">

          <span>✦ AI GUIDANCE</span>

          <h2>
            Improve your match score by learning
            missing skills.
          </h2>

          <p>
            Your strongest matches are based on the skills
            detected in your resume. Continue your roadmap
            to unlock more opportunities.
          </p>

          <button
            onClick={() => navigate("/roadmap")}
          >
            Continue Learning →
          </button>

        </div>

      </div>

    </div>
  );
}

export default JobMatching;