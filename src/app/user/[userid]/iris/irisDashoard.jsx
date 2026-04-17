"use client";

import { useEffect, useRef, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function IrisDashboard({ userid }) {
  const sdkLoaded = useRef(false);

  const [status, setStatus] = useState("Loading SDK...");
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [irisBase64, setIrisBase64] = useState("");
  const [irisImage, setIrisImage] = useState("");
  const [quality, setQuality] = useState("");

  const getToken = () => localStorage.getItem("token");

  /* ================= LOAD SDK ================= */
  useEffect(() => {
    if (sdkLoaded.current) return;
    sdkLoaded.current = true;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();

        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    (async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
        await loadScript("/marvisauth.js");

        setStatus("SDK Loaded ✔");
      } catch (err) {
        setStatus("SDK Load Failed ❌");
      }
    })();
  }, []);

  /* ================= GET DEVICE ================= */
  const getInfo = () => {
    try {
      const res = window.GetMarvisAuthInfo();

      if (res?.data?.ErrorCode === "0") {
        setDeviceInfo(res.data.DeviceInfo1);
        setStatus("Device Connected ✔");
      } else {
        setStatus("Device Not Connected ❌");
      }
    } catch (err) {
      setStatus("SDK Error ❌");
    }
  };

  /* ================= CAPTURE IRIS ================= */
  const captureIris = () => {
    try {
      setStatus("Capturing...");

      const res = window.CaptureIris(15, 55);

      if (!res?.data || res.data.ErrorCode !== "0") {
        setStatus("Capture Failed ❌");
        return;
      }

      const bmp = res.data.BitmapData;

      setIrisBase64(bmp);
      setIrisImage("data:image/bmp;base64," + bmp);
      setQuality(res.data.Quality);

      setStatus("Captured ✔");
    } catch (err) {
      console.error(err);
      setStatus("Capture Error ❌");
    }
  };

  /* ================= ENROLL (FIXED SAFE) ================= */
  const enrollIris = async () => {
    const token = getToken();

    if (!token) return setStatus("Login Required ❌");
    if (!irisBase64) return setStatus("No Iris Captured ❌");

    try {
      setStatus("Enrolling...");

      const res = await fetch(`${BASE_URL}/iris/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          irisImage: irisBase64,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("Iris Enrolled ✔");
      } else {
        setStatus(data.message || data.error || "Enroll Failed ❌");
      }
    } catch (err) {
      console.error(err);
      setStatus("Backend Not Reachable ❌");
    }
  };

  /* ================= VERIFY ================= */
  const verifyIris = async () => {
    const token = getToken();

    if (!token) return setStatus("Login Required ❌");
    if (!irisBase64) return setStatus("No Iris Captured ❌");

    try {
      setStatus("Verifying...");

      const res = await fetch(`${BASE_URL}/iris/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          irisImage: irisBase64,
        }),
      });

      const data = await res.json();

      if (data.success || data.verified) {
        setStatus("✔ Verified");
      } else {
        setStatus("❌ Not Matched");
      }
    } catch (err) {
      setStatus("Verify Error ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👁 Iris System - User {userid}</h2>

      <p><b>Status:</b> {status}</p>

      {deviceInfo && (
        <div style={{ background: "#eee", padding: 10 }}>
          <p>Device Connected</p>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={getInfo}>Get Info</button>
        <button onClick={captureIris}>Capture</button>
        <button onClick={enrollIris}>Enroll</button>
        <button onClick={verifyIris}>Verify</button>
      </div>

      {quality && <p>Quality: {quality}</p>}

      {irisImage && (
        <img src={irisImage} width={200} alt="iris" />
      )}

      <textarea value={irisBase64} readOnly style={{ width: "100%", height: 120 }} />
    </div>
  );
}