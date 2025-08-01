// pages/Attendance-result.js
"use client";
import { useEffect, useState } from "react";

export default function AttendanceResult() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [captured, setCaptured] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserId(params.get("userId") || "");
    setName(params.get("name") || "");
    setRole(params.get("role") || "");
    setCaptured(params.get("captured") || "");
    setMessage(params.get("message") || "");
  }, []);

  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  return (
    <main className="result-page">
      <div className="card-container">
        <h1 className="title">✅ Attendance Submitted</h1>

        <div className="card">
          {captured && (
            <img
              src={decodeURIComponent(captured)}
              alt="Captured Face"
              style={{ borderRadius: "12px", maxWidth: "100%", marginBottom: "1rem" }}
            />
          )}
          <div className="info">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>ID:</strong> {userId}</p>
            <p><strong>Role:</strong> {role}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Time:</strong> {time}</p>
            <p><strong>Status:</strong> {message}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
