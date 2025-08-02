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
  const streamRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const loadModelsAndStartCamera = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setTimeout(autoCapturePhoto, 1500);
        };
      }
    };

    loadModelsAndStartCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const autoCapturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detection = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const image = canvas.toDataURL("image/png");
      const descriptor = Array.from(detection.descriptor);

      console.log("✅ Face detected:", descriptor);

      setImageData(image);
      setFaceDescriptor(descriptor);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    } else {
      console.log("❌ No face detected. Retrying...");
      setTimeout(autoCapturePhoto, 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !userId || !imageData || !faceDescriptor?.length) {
      alert("⚠️ FRONTEND: Missing form data or face not detected.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userId, role, imageData, faceDescriptor }),
      });

      const result = await res.json();
      console.log("📡 Response status:", res.status);
      console.log("📦 Response body:", result);

      if (res.status === 200) {
        router.push({
          pathname: "/success",
          query: { name, role, imageData, userId }, // ✅ userId added here
        });
      } else {
        alert("⚠️ BACKEND: " + result.message);
      }
    } catch (err) {
      console.error("🚨 Fetch error:", err);
      alert("🚨 FRONTEND: Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center bg-gray-100 overflow-hidden'>
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
              {!imageData && (
                <video
                  ref={videoRef}
                  width="300"
                  height="200"
                  autoPlay
                  playsInline
                />
              )}
              <canvas
                ref={canvasRef}
                width="300"
                height="200"
                style={{ display: "none" }}
              />
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
