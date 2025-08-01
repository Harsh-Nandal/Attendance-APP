"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Register.module.css";
import * as faceapi from "face-api.js";

export default function Register() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("student");
  const [imageData, setImageData] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState([]);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    };

    loadModels();

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []);

  const capturePhoto = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/png");
    setImageData(image);

    const detection = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setFaceDescriptor(Array.from(detection.descriptor)); // Convert Float32Array to array
    } else {
      alert("No face detected. Please try again.");
      setFaceDescriptor([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faceDescriptor.length) {
      alert("Please capture your face first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId, role, imageData, faceDescriptor }),
      });

      const result = await res.json();
      if (res.ok) {
        router.push({
          pathname: "/success",
          query: { name, role, imageData },
        });
      } else {
        alert(result.message || "Something went wrong");
        setLoading(false);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loader}>Submitting...</div>
      ) : (
        <>
          <h2 className={styles.heading}>Register Student / Faculty</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              className={styles.inputField}
              placeholder="ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />

            <select
              className={styles.inputField}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>

            <div className={styles.camera}>
              <video
                ref={videoRef}
                width="300"
                height="200"
                autoPlay
                playsInline
              />
              <canvas
                ref={canvasRef}
                width="300"
                height="200"
                style={{ display: "none" }}
              />
              <button type="button" onClick={capturePhoto}>
                📸 Capture Image
              </button>
            </div>

            {imageData && (
              <img src={imageData} alt="Captured" className={styles.preview} />
            )}

            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </form>
        </>
      )}
    </div>
  );
}
