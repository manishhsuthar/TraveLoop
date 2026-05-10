import { useState } from "react";
import { login, setAuthToken, signup } from "../api/client";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { username, password };
      if (mode === "signup") payload.email = email;
      const data = mode === "signup" ? await signup(payload) : await login(payload);
      localStorage.setItem("traveloop_token", data.token);
      localStorage.setItem("traveloop_username", data.username);
      setAuthToken(data.token);
      onAuth({ token: data.token, username: data.username });
    } catch {
      setError("Authentication failed. Check credentials and try again.");
    }
  };

  return (
    <section>
      <h1>{mode === "login" ? "Login" : "Signup"}</h1>
      <form className="form" onSubmit={submit}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        {mode === "signup" && (
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        )}
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />
        <button type="submit">{mode === "login" ? "Login" : "Create account"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button className="link-btn" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Need an account? Signup" : "Have an account? Login"}
      </button>
    </section>
  );
}
