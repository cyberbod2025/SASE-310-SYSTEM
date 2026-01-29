import React, { useState, useEffect } from "react";

export const Login: React.FC<any> = ({ onDemoEnter }) => {
  const [debug, setDebug] = useState("Initializing...");

  useEffect(() => {
    setDebug("Mounted successfully. Screen should not be blank.");
  }, []);

  return (
    <div
      style={{
        background: "#0a1930",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>SASE-310</h1>
      <p style={{ opacity: 0.7 }}>{debug}</p>
      <button
        onClick={onDemoEnter}
        style={{
          marginTop: "2rem",
          padding: "1rem 2rem",
          background: "#3b82f6",
          border: "none",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Entrar (Demo)
      </button>
    </div>
  );
};
