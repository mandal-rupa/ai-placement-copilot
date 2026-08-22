import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Roadmap() {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState([]);

  useEffect(() => {
    const savedAnalysis = localStorage.getItem("resumeAnalysis");

    if (savedAnalysis) {
      const parsed = JSON.parse(savedAnalysis);
      setAnalysis(parsed);
      generateRoadmap(parsed);
    } else {
      generateRoadmap(null);
    }
  }, []);

  // ==========================================
  // ALL AVAILABLE LEARNING MODULES
  // ==========================================

  const availableModules = [
    {
      number: "01",
      title: "TypeScript",
      module: "typescript",
      description:
        "Build strong TypeScript fundamentals for modern frontend development.",
      relatedSkills: ["typescript"],
      topics: [
        "TypeScript Basics",
        "Types and Interfaces",
        "Functions and Generics",
      ],
    },

    {
      number: "02",
      title: "REST API",
      module: "rest-api",
      description:
        "Learn how frontend applications communicate with backend services.",
      relatedSkills: ["rest api", "rest-api"],
      topics: [
        "HTTP Methods",
        "REST API Concepts",
        "API Integration",
      ],
    },

    {
      number: "03",
      title: "Docker",
      module: "docker",
      description:
        "Learn how to containerize and run your applications consistently.",
      relatedSkills: ["docker"],
      topics: [
        "Docker Basics",
        "Images and Containers",
        "Running Applications",
      ],
    },

    {
      number: "04",
      title: "Git & GitHub",
      module: "git-github",
      description:
        "Learn version control and collaborative software development.",
      relatedSkills: ["git", "github"],
      topics: [
        "Git Basics",
        "Branches and Commits",
        "GitHub Workflow",
      ],
    },

    {
      number: "05",
      title: "SQL",
      module: "sql",
      description:
        "Learn relational databases and SQL queries used in software development.",
      relatedSkills: ["sql"],
      topics: [
        "SQL Basics",
        "Queries and Joins",
        "Database Operations",
      ],
    },
  ];

  // ==========================================
  // GENERATE PERSONALIZED ROADMAP
  // ==========================================

  const generateRoadmap = (resumeAnalysis) => {
    const currentSkills = (
      resumeAnalysis?.skills || []
    ).map((skill) => skill.toLowerCase().trim());

    const missingModules = availableModules.filter(
      (item) => {
        return item.relatedSkills.some(
          (skill) =>
            !currentSkills.includes(
              skill.toLowerCase()
            )
        );
      }
    );

    // If resume is not analyzed, show the main
    // recommended modules.
    if (!resumeAnalysis) {
      setRoadmap(
        availableModules.slice(0, 3)
      );
      return;
    }

    // If no missing skill is found,
    // still recommend important modules.
    if (missingModules.length === 0) {
      setRoadmap(
        availableModules.slice(0, 3)
      );
      return;
    }

    setRoadmap(
      missingModules.map((item, index) => ({
        ...item,
        number: String(index + 1).padStart(2, "0"),
      }))
    );
  };

  // ==========================================
  // PROGRESS
  // ==========================================

  const getCompletedTopics = (module) => {
    const saved = localStorage.getItem(
      `completed-${module}`
    );

    return saved ? JSON.parse(saved) : [];
  };

  const calculateProgress = () => {
    let completedCount = 0;
    let totalCount = 0;

    roadmap.forEach((item) => {
      const completed =
        getCompletedTopics(item.module);

      completedCount += completed.length;
      totalCount += item.topics.length;
    });

    return {
      completedCount,
      totalCount,
      percentage:
        totalCount > 0
          ? Math.round(
              (completedCount / totalCount) * 100
            )
          : 0,
    };
  };

  const [progressData, setProgressData] = useState({
    completedCount: 0,
    totalCount: 0,
    percentage: 0,
  });

  useEffect(() => {
    setProgressData(calculateProgress());

    const updateProgress = () => {
      setProgressData(calculateProgress());
    };

    window.addEventListener(
      "focus",
      updateProgress
    );

    window.addEventListener(
      "storage",
      updateProgress
    );

    return () => {
      window.removeEventListener(
        "focus",
        updateProgress
      );

      window.removeEventListener(
        "storage",
        updateProgress
      );
    };
  }, [roadmap]);

  const {
    completedCount,
    totalCount,
    percentage,
  } = progressData;

  return (
    <div className="roadmap-page">

      <div className="roadmap-container">

        {/* BACK */}

        <button
          className="back-btn"
          onClick={() =>
            navigate("/skill-gap")
          }
        >
          ← Skill Gap
        </button>

        {/* HEADING */}

        <div className="roadmap-heading">

          <span>
            AI LEARNING ROADMAP
          </span>

          <h1>
            Your personalized path to
            <br />
            <strong>
              placement readiness.
            </strong>
          </h1>

          <p>
            Your learning journey is generated
            from the skills detected in your resume
            and the requirements of your target role.
          </p>

        </div>

        {/* SUMMARY */}

        <div className="roadmap-summary">

          <div>
            <span>
              TARGET ROLE
            </span>

            <strong>
              {analysis?.targetRole ||
                "Frontend Developer"}
            </strong>
          </div>

          <div>
            <span>
              SKILLS TO LEARN
            </span>

            <strong>
              {roadmap.length}
            </strong>
          </div>

          <div>
            <span>
              PROGRESS
            </span>

            <strong>
              {percentage}%
            </strong>
          </div>

        </div>

        {/* PROGRESS */}

        <div className="roadmap-progress">

          <div className="progress-header">

            <span>
              Your learning progress
            </span>

            <strong>
              {completedCount}/{totalCount} topics
            </strong>

          </div>

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width: `${percentage}%`,
              }}
            ></div>

          </div>

        </div>

        {/* ROADMAP */}

        {roadmap.length === 0 ? (

          <div className="roadmap-empty">

            <h2>
              No learning modules available
            </h2>

            <p>
              Analyze your resume to generate
              a personalized learning roadmap.
            </p>

            <button
              onClick={() =>
                navigate("/resume")
              }
            >
              Analyze Resume →
            </button>

          </div>

        ) : (

          <div className="roadmap-list">

            {roadmap.map((item) => {

              const completed =
                getCompletedTopics(
                  item.module
                );

              const moduleCompleted =
                completed.length;

              const moduleProgress =
                Math.round(
                  (moduleCompleted /
                    item.topics.length) *
                    100
                );

              return (
                <div
                  className="roadmap-card"
                  key={item.module}
                >

                  <div className="roadmap-number">
                    {item.number}
                  </div>

                  <div className="roadmap-content">

                    <span className="roadmap-label">
                      PERSONALIZED LEARNING MODULE
                    </span>

                    <h2>
                      {item.title}
                    </h2>

                    <p>
                      {item.description}
                    </p>

                    {/* MODULE PROGRESS */}

                    <div className="roadmap-module-progress">

                      <span>
                        {moduleCompleted}/
                        {item.topics.length}
                        {" "}completed
                      </span>

                      <div className="module-progress-track">

                        <div
                          className="module-progress-fill"
                          style={{
                            width:
                              `${moduleProgress}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                    {/* TOPICS */}

                    <div className="roadmap-topics">

                      {item.topics.map(
                        (topic) => {

                          const isCompleted =
                            completed.includes(
                              topic
                            );

                          return (
                            <span
                              className={
                                isCompleted
                                  ? "topic completed"
                                  : "topic"
                              }
                              key={topic}
                            >
                              {isCompleted
                                ? "✓"
                                : "○"}{" "}
                              {topic}
                            </span>
                          );
                        }
                      )}

                    </div>

                    {/* LEARNING BUTTON */}

                    <button
                      className="start-learning-btn"
                      onClick={() =>
                        navigate(
                          `/learn/${item.module}`
                        )
                      }
                    >
                      {moduleCompleted ===
                      item.topics.length
                        ? "Review Module →"
                        : "Start Learning →"}
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* AI GUIDANCE */}

        <div className="roadmap-bottom">

          <span>
            ✦ AI GUIDANCE
          </span>

          <h2>
            {percentage === 100
              ? "Amazing! You completed your roadmap."
              : "Master your missing skills to improve placement readiness."}
          </h2>

          <p>
            {percentage === 100
              ? "You have completed all recommended topics. Keep practicing with real projects and interviews."
              : `Complete the ${roadmap.length} recommended learning module${
                  roadmap.length !== 1 ? "s" : ""
                } step by step and continue practicing.`}
          </p>

          {percentage === 100 && (
            <button
              onClick={() =>
                navigate("/mock-interview")
              }
            >
              Practice Mock Interview →
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default Roadmap;