import React, { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Registered successfully!");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Logged in successfully!");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>🔐 Login / Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleRegister}>Register</button>
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Auth;
