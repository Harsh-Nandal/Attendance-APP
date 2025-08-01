"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [captured, setCaptured] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("userId");
    const uname = params.get("name");
    const urole = params.get("role");
    const img = params.get("captured");

    if (uid && uname && urole && img) {
      setUserId(uid);
      setName(uname);
      setRole(urole);
      setCaptured(img);
    }

    setLoading(false);
  }, []);

  const handleSubmit = async () => {
    if (!userId) {
      alert("User ID missing!");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/submit-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();

      router.push(
        `/attendance-result?userId=${userId}&name=${name}&role=${role}&captured=${encodeURIComponent(
          captured
        )}&message=${encodeURIComponent(result.message)}`
      );
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Something went wrong while submitting attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="success-page">
        <div className="card-container">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="success-page">
      <div className="card-container">
        <h1 className="title">🎉 Attendance Details</h1>

        <div className="card">
          {captured && (
            <img
              src={decodeURIComponent(captured)}
              alt="Captured Face"
              style={{
                borderRadius: "12px",
                maxWidth: "100%",
                marginBottom: "1rem",
              }}
            />
          )}
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>ID:</strong> {userId}
          </p>
          <p>
            <strong>Role:</strong> {role}
          </p>

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "⏳ Submitting..." : "📥 Submit Attendance"}
          </button>
          <Link href={".."}>
          HOme</Link>
        </div>
      </div>
    </main>
  );
}
