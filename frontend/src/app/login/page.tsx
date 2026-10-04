"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "pass123") {
      localStorage.setItem("role", "admin");
      router.push("/admin");
    } else if (username === "user" && password === "pass123") {
      localStorage.setItem("role", "user");
      router.push("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Sign In</h1>
          <p style={{ color: "var(--text-muted)" }}>Welcome back to Wasila</p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {error && <div style={{ color: "red", fontSize: "0.875rem", textAlign: "center" }}>{error}</div>}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
              Username
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
              Password
            </label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" style={{ accentColor: "var(--amber-primary)" }} />
              <span>Remember me</span>
            </label>
            <a href="#" style={{ color: "var(--amber-primary)", fontWeight: 500 }}>Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Don't have an account? <a href="#" style={{ color: "var(--amber-primary)", fontWeight: 500 }}>Register for OneID</a>
        </div>
      </div>
    </div>
  );
}
