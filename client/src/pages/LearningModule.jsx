import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import "./LearningModule.css";

function LearningModule() {
  const navigate = useNavigate();
  const { module } = useParams();

  const storageKey = `completed-${module}`;

  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ==========================================
  // LEARNING MODULES
  // ==========================================

  const modules = {
    javascript: {
      title: "JavaScript",
      description:
        "Strengthen your JavaScript fundamentals for frontend development and interviews.",
      topics: [
        {
          title: "Variables and Data Types",
          content:
            "Learn variables, primitive data types, type conversion and basic JavaScript syntax.",
        },
        {
          title: "Functions and ES6",
          content:
            "Learn functions, arrow functions, template literals, destructuring and modern ES6 features.",
        },
        {
          title: "Arrays and Objects",
          content:
            "Understand arrays, objects and common methods used in real JavaScript applications.",
        },
      ],
    },

    react: {
      title: "React",
      description:
        "Build strong React fundamentals and learn how to create reusable frontend applications.",
      topics: [
        {
          title: "Components and JSX",
          content:
            "Learn functional components, JSX syntax and how React builds user interfaces.",
        },
        {
          title: "Props and State",
          content:
            "Understand how data flows through props and how state controls component behaviour.",
        },
        {
          title: "Hooks and API Integration",
          content:
            "Learn useState, useEffect and how React applications communicate with APIs.",
        },
      ],
    },

    "node-js": {
      title: "Node.js",
      description:
        "Learn backend development with Node.js and understand server-side JavaScript.",
      topics: [
        {
          title: "Node.js Basics",
          content:
            "Understand Node.js, the runtime environment and how JavaScript runs outside the browser.",
        },
        {
          title: "Modules and npm",
          content:
            "Learn modules, package.json, npm and how to install and manage dependencies.",
        },
        {
          title: "Creating a Server",
          content:
            "Learn how to create a basic Node.js server and handle incoming requests.",
        },
      ],
    },

    express: {
      title: "Express.js",
      description:
        "Learn how to build REST APIs and backend services using Express.js.",
      topics: [
        {
          title: "Express Basics",
          content:
            "Learn how to create an Express application and understand its basic structure.",
        },
        {
          title: "Routes and Middleware",
          content:
            "Understand routes, middleware and how requests move through an Express application.",
        },
        {
          title: "REST API Development",
          content:
            "Learn how to create API endpoints and return JSON responses from your backend.",
        },
      ],
    },

    mongodb: {
      title: "MongoDB",
      description:
        "Learn database fundamentals and how MongoDB is used in full-stack applications.",
      topics: [
        {
          title: "MongoDB Basics",
          content:
            "Understand databases, collections, documents and the basic MongoDB data model.",
        },
        {
          title: "Collections and Documents",
          content:
            "Learn how data is organized and stored inside MongoDB collections.",
        },
        {
          title: "CRUD Operations",
          content:
            "Learn how to create, read, update and delete MongoDB documents.",
        },
      ],
    },

    typescript: {
      title: "TypeScript",
      description:
        "Build strong TypeScript fundamentals for modern frontend development.",
      topics: [
        {
          title: "TypeScript Basics",
          content:
            "Learn variables, types, annotations and the basic structure of TypeScript.",
        },
        {
          title: "Types and Interfaces",
          content:
            "Understand interfaces, custom types and how TypeScript improves code safety.",
        },
        {
          title: "Functions and Generics",
          content:
            "Learn typed functions, parameters, return types and generic programming.",
        },
      ],
    },

    "rest-api": {
      title: "REST API",
      description:
        "Learn how frontend applications communicate with backend services.",
      topics: [
        {
          title: "HTTP Methods",
          content:
            "Understand GET, POST, PUT, PATCH and DELETE requests.",
        },
        {
          title: "REST API Concepts",
          content:
            "Learn resources, endpoints, requests, responses and HTTP status codes.",
        },
        {
          title: "API Integration",
          content:
            "Learn how to connect a React application with a REST API.",
        },
      ],
    },

    docker: {
      title: "Docker",
      description:
        "Learn how to containerize and run applications consistently.",
      topics: [
        {
          title: "Docker Basics",
          content:
            "Understand containers, images and the basic Docker workflow.",
        },
        {
          title: "Images and Containers",
          content:
            "Learn how Docker images are created and how containers run them.",
        },
        {
          title: "Running Applications",
          content:
            "Learn how to run and manage applications inside Docker containers.",
        },
      ],
    },

    git: {
      title: "Git",
      description:
        "Learn version control and manage your software projects professionally.",
      topics: [
        {
          title: "Git Basics",
          content:
            "Learn repositories, commits and the basic Git workflow.",
        },
        {
          title: "Branches and Merging",
          content:
            "Understand branches and how changes can be merged safely.",
        },
        {
          title: "Git Workflow",
          content:
            "Learn how to use Git effectively while developing projects.",
        },
      ],
    },

    github: {
      title: "GitHub",
      description:
        "Learn how to collaborate, manage repositories and showcase projects.",
      topics: [
        {
          title: "Repositories",
          content:
            "Learn how to create and manage GitHub repositories.",
        },
        {
          title: "Commits and Push",
          content:
            "Learn how to push local project changes to GitHub.",
        },
        {
          title: "Pull Requests",
          content:
            "Understand pull requests and basic collaborative development.",
        },
      ],
    },

    sql: {
      title: "SQL",
      description:
        "Learn relational database concepts and write SQL queries.",
      topics: [
        {
          title: "SQL Basics",
          content:
            "Learn tables, rows, columns and basic SQL syntax.",
        },
        {
          title: "SELECT and JOIN",
          content:
            "Learn how to retrieve data and combine information from multiple tables.",
        },
        {
          title: "CRUD Queries",
          content:
            "Practice INSERT, SELECT, UPDATE and DELETE operations.",
        },
      ],
    },

    python: {
      title: "Python",
      description:
        "Strengthen Python fundamentals for programming and AI development.",
      topics: [
        {
          title: "Python Basics",
          content:
            "Learn variables, data types, conditions and loops in Python.",
        },
        {
          title: "Functions and Data Structures",
          content:
            "Learn functions and commonly used Python data structures.",
        },
        {
          title: "Object-Oriented Programming",
          content:
            "Understand classes, objects and basic OOP concepts in Python.",
        },
      ],
    },

    java: {
      title: "Java",
      description:
        "Build strong Java programming fundamentals for software development.",
      topics: [
        {
          title: "Java Basics",
          content:
            "Learn Java syntax, variables, data types and control statements.",
        },
        {
          title: "OOP Concepts",
          content:
            "Understand classes, objects, inheritance and polymorphism.",
        },
        {
          title: "Collections and Exceptions",
          content:
            "Learn Java collections and basic exception handling.",
        },
      ],
    },

    html: {
      title: "HTML",
      description:
        "Learn semantic HTML and build well-structured web pages.",
      topics: [
        {
          title: "HTML Basics",
          content:
            "Learn elements, attributes, headings, paragraphs and links.",
        },
        {
          title: "Forms and Inputs",
          content:
            "Learn how HTML forms and input elements collect user information.",
        },
        {
          title: "Semantic HTML",
          content:
            "Learn semantic elements and how to structure accessible web pages.",
        },
      ],
    },

    css: {
      title: "CSS",
      description:
        "Improve your ability to create responsive and professional interfaces.",
      topics: [
        {
          title: "CSS Basics",
          content:
            "Learn selectors, properties, spacing, typography and the CSS box model.",
        },
        {
          title: "Flexbox and Grid",
          content:
            "Learn modern CSS layout systems for creating structured interfaces.",
        },
        {
          title: "Responsive Design",
          content:
            "Learn media queries and techniques for building mobile-friendly websites.",
        },
      ],
    },
  };

  const currentModule = modules[module];

  // ==========================================
  // TOGGLE TOPIC
  // ==========================================

  const toggleTopic = (topicTitle) => {
    setCompletedTopics((prev) => {
      const updated = prev.includes(topicTitle)
        ? prev.filter(
            (item) => item !== topicTitle
          )
        : [...prev, topicTitle];

      localStorage.setItem(
        storageKey,
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  // ==========================================
  // MODULE NOT FOUND
  // ==========================================

  if (!currentModule) {
    return (
      <div className="learning-page">

        <div className="learning-container">

          <button
            className="back-btn"
            onClick={() =>
              navigate("/roadmap")
            }
          >
            ← Back to Roadmap
          </button>

          <div className="learning-heading">

            <span>
              LEARNING MODULE
            </span>

            <h1>
              Module not found
            </h1>

            <p>
              This learning module is not available yet.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // PROGRESS
  // ==========================================

  const totalTopics =
    currentModule.topics.length;

  const completedCount =
    completedTopics.length;

  const progress =
    totalTopics > 0
      ? Math.round(
          (completedCount /
            totalTopics) *
            100
        )
      : 0;

  const moduleCompleted =
    completedCount === totalTopics;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="learning-page">

      <div className="learning-container">

        {/* BACK */}

        <button
          className="back-btn"
          onClick={() =>
            navigate("/roadmap")
          }
        >
          ← Roadmap
        </button>


        {/* HEADER */}

        <div className="learning-heading">

          <span>
            LEARNING MODULE
          </span>

          <h1>
            {currentModule.title}
          </h1>

          <p>
            {currentModule.description}
          </p>

        </div>


        {/* PROGRESS */}

        <div className="learning-progress">

          <div className="learning-progress-header">

            <span>
              MODULE PROGRESS
            </span>

            <strong>
              {completedCount}/{totalTopics} completed
            </strong>

          </div>

          <div className="learning-progress-track">

            <div
              className="learning-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            ></div>

          </div>

          <small>
            {progress}% complete
          </small>

        </div>


        {/* TOPICS */}

        <div className="learning-topics">

          {currentModule.topics.map(
            (topic, index) => {

              const isCompleted =
                completedTopics.includes(
                  topic.title
                );

              return (
                <div
                  className={
                    isCompleted
                      ? "learning-topic completed"
                      : "learning-topic"
                  }
                  key={topic.title}
                >

                  <div className="topic-number">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>


                  <div className="topic-content">

                    <span>
                      TOPIC {index + 1}
                    </span>

                    <h2>
                      {topic.title}
                    </h2>

                    <p>
                      {topic.content}
                    </p>


                    <button
                      type="button"
                      className={
                        isCompleted
                          ? "complete-topic-btn completed"
                          : "complete-topic-btn"
                      }
                      onClick={() =>
                        toggleTopic(
                          topic.title
                        )
                      }
                    >
                      {isCompleted
                        ? "Completed ✓"
                        : "Mark as Completed ✓"}
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>


        {/* COMPLETION MESSAGE */}

        {moduleCompleted && (

          <div className="learning-complete">

            <span>
              ✦ MODULE COMPLETE
            </span>

            <h2>
              Great work! You completed{" "}
              {currentModule.title}.
            </h2>

            <p>
              Continue to the next module in
              your learning roadmap.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/roadmap")
              }
            >
              Back to Roadmap →
            </button>

          </div>

        )}

      </div>

    </div>
  );
}

export default LearningModule;