// ✅ Home.js
"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();

  const handleClose = () => setShowPopup(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const handleAppInstalled = () => setIsInstalled(true);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choice) => {
        if (choice.outcome === "accepted") {
          setInstallPrompt(null);
          setIsInstalled(true);
        }
      });
    }
  };

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  };

  const handleAttendance = async () => {
    setLoading(true);
    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setShowPopup(true);
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      const imageData = captureImage();

      const res = await fetch("/api/verify-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      });

      const result = await res.json();

      if (result.success) {
        await fetch("/api/send-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: result.user.name,
            role: result.user.role,
            userId: result.user.userId, // ✅ this is required
            imageData,
          }),
        });

        router.push(
          `/success?name=${result.user.name}&role=${result.user.role}&image=${
            result.user.imageUrl
          }&userId=${result.user.userId}&captured=${encodeURIComponent(
            imageData
          )}`
        );
      } else {
        setShowPopup(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred during attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container">
      {showPopup && (
        <div className="popupOverlay">
          <div className="popupBox">
            <h2>Welcome!</h2>
            <p>
              You were not detected <br />
              Please choose your option:
            </p>
            <div className="buttons">
              <Link href="/newStudent">
                <button>New Student</button>
              </Link>
              <button onClick={handleClose}>Already Registered</button>
            </div>
            <button onClick={handleClose} className="closeBtn">
              ✕
            </button>
          </div>
        </div>
      )}

      <img src="/logo.png" alt="Logo" className="logo" />

      <div className="camera-circle">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-feed"
        />
      </div>

      <h1 className="heading">
        Welcome <br /> to <br /> MDCI
      </h1>

      <button
        className="attendance-btn"
        onClick={handleAttendance}
        disabled={loading}
      >
        {loading ? "Detecting..." : "Mark Your Daily Attendance"}
      </button>

      {!isInstalled && installPrompt && (
        <button onClick={handleInstall} className="install-btn">
          Install App
        </button>
      )}

      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
          <p>Detecting your face...</p>
        </div>
      )}
    </main>
  );
}
