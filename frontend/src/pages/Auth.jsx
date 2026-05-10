import { useState } from "react";
import { login, setAuthToken, signup } from "../api/client";
import "../App.css";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        // Register first, then login to get JWT tokens
        const payload = { username, password };
        if (email) payload.email = email;
        await signup(payload);
        // After registration, auto-login
        const loginData = await login({ username, password });
        localStorage.setItem("traveloop_token", loginData.access);
        localStorage.setItem("traveloop_refresh", loginData.refresh);
        localStorage.setItem("traveloop_username", username);
        setAuthToken(loginData.access);
        onAuth({ token: loginData.access, username });
      } else {
        // Login — JWT returns { access, refresh }
        const data = await login({ username, password });
        localStorage.setItem("traveloop_token", data.access);
        localStorage.setItem("traveloop_refresh", data.refresh);
        localStorage.setItem("traveloop_username", username);
        setAuthToken(data.access);
        onAuth({ token: data.access, username });
      }
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.username?.[0] ||
        "Authentication failed. Check credentials and try again.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-avatar">✈</div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in to access your trips"
            : "Create an account to start planning"}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === "login" ? " active" : ""}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab${mode === "signup" ? " active" : ""}`}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            autoComplete="username"
          />
          {mode === "signup" && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              type="email"
              autoComplete="email"
            />
          )}
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {error && (
          <p className="error" style={{ marginTop: "0.8rem", textAlign: "center" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
