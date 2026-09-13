import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);

    alert("Login button clicked");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Customer Login</h2>

      <form onSubmit={handleLogin}>

        <div style={{ marginBottom: "20px" }}>
          <label>Email Address:</label>
          <br />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Password:</label>
          <br />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px 25px",
            cursor: "pointer"
          }}
        >
          Login
        </button>

      </form>
    </div>
  );
}

export default Login;