import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      console.log("Login started...");
      console.log("Email:", form.email);

      // ==========================================
      // LOGIN API
      // ==========================================

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: form.email.trim(),
          password: form.password,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Login response:",
        response.data
      );

      // ==========================================
      // CHECK TOKEN
      // ==========================================

      if (!response.data?.token) {
        throw new Error(
          "Login successful but server did not return a token."
        );
      }

      // ==========================================
      // SAVE TOKEN
      // ==========================================

      localStorage.setItem(
        "token",
        response.data.token
      );

      // ==========================================
      // SAVE USER
      // ==========================================

      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      console.log(
        "Token saved successfully."
      );

      // ==========================================
      // GO TO DASHBOARD
      // ==========================================

      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      // ==========================================
      // TIMEOUT
      // ==========================================

      if (
        err.code === "ECONNABORTED"
      ) {
        setError(
          "Server is taking too long to respond. Make sure the backend is running."
        );

        return;
      }

      // ==========================================
      // BACKEND RESPONSE ERROR
      // ==========================================

      if (err.response) {
        console.error(
          "Status:",
          err.response.status
        );

        console.error(
          "Backend response:",
          err.response.data
        );

        setError(
          err.response.data?.message ||
            `Login failed (${err.response.status}).`
        );

        return;
      }

      // ==========================================
      // NETWORK ERROR
      // ==========================================

      if (err.request) {
        setError(
          "Cannot connect to backend. Make sure server is running on port 5000."
        );

        return;
      }

      // ==========================================
      // OTHER ERROR
      // ==========================================

      setError(
        err.message ||
          "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <Link
          to="/"
          className="auth-logo"
        >
          ✦ AI Placement Copilot
        </Link>

        {/* HEADING */}

        <div className="auth-heading">

          <span>
            WELCOME BACK
          </span>

          <h1>
            Login to your account
          </h1>

          <p>
            Continue your journey toward
            placement readiness.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

          <label>
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login →"}

          </button>

        </form>

        {/* REGISTER */}

        <p className="auth-switch">

          Don't have an account?{" "}

          <Link to="/register">
            Create Account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;