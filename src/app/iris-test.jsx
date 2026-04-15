"use client";

import { useEffect, useRef, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function IrisSystem() {
  const sdkLoaded = useRef(false);

  const [status, setStatus] = useState("Loading SDK...");
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [irisBase64, setIrisBase64] = useState("");
  const [irisImage, setIrisImage] = useState("");
  const [quality, setQuality] = useState(0);

  /* ---------------- LOAD SDK ---------------- */
  useEffect(() => {
    if (sdkLoaded.current) return;
    sdkLoaded.current = true;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();

        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(`Failed to load ${src}`);
        document.body.appendChild(script);
      });

    (async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
        await loadScript("/marvisauth.js");

        if (!window.GetMarvisAuthInfo || !window.CaptureIris) {
          setStatus("SDK Functions Missing ❌");
          return;
        }

        setStatus("SDK Ready ✅");
      } catch (err) {
        console.error(err);
        setStatus("SDK Load Failed ❌");
      }
    })();
  }, []);

  /* ---------------- DEVICE INFO ---------------- */
  const getInfo = () => {
    try {
      const res = window.GetMarvisAuthInfo();

      if (res?.data?.ErrorCode === "0") {
        setDeviceInfo(res.data.DeviceInfo1);
        setStatus("Device Connected ✅");
      } else {
        setStatus("Device Not Connected ❌");
      }
    } catch {
      setStatus("Device Error ❌");
    }
  };

  /* ---------------- CAPTURE ---------------- */
  const captureIris = () => {
    try {
      setStatus("Capturing...");

      const res = window.CaptureIris(15, 55);

      if (!res?.data || res.data.ErrorCode !== "0") {
        setStatus("Capture Failed ❌");
        return;
      }

      const bmpBase64 = res.data.BitmapData;
      const q = parseInt(res.data.Quality || "0");

      if (!bmpBase64) {
        setStatus("No Image ❌");
        return;
      }

      // 🔥 QUALITY CHECK (IMPORTANT)
      if (q < 60) {
        setStatus(`Low Quality (${q}) ❌ Retake`);
        return;
      }

      setIrisBase64(bmpBase64);
      setIrisImage("data:image/bmp;base64," + bmpBase64);
      setQuality(q);

      setStatus(`Capture OK ✅ (Quality: ${q})`);

      window.UnInit?.();
    } catch (err) {
      console.error(err);
      setStatus("Capture Error ❌");
    }
  };

  /* ---------------- ENROLL ---------------- */
  const enrollIris = async () => {
    const token = localStorage.getItem("token");

    if (!token) return setStatus("Login Required ❌");
    if (!irisBase64) return setStatus("Capture first ❌");

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

      setStatus(
        data.success ? "Iris Enrolled ✅" : data.error || "Enroll Failed ❌"
      );
    } catch {
      setStatus("Server Error ❌");
    }
  };

  /* ---------------- VERIFY ---------------- */
  const verifyIris = async () => {
    const token = localStorage.getItem("token");

    if (!token) return setStatus("Login Required ❌");
    if (!irisBase64) return setStatus("Capture first ❌");

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

      if (data.verified) {
        setStatus(`✅ Verified (distance: ${data.distance})`);
      } else {
        setStatus(`❌ Not Matched (distance: ${data.distance})`);
      }
    } catch {
      setStatus("Verify Error ❌");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: 20 }}>
      <h2>👁 Iris System</h2>

      <p><b>Status:</b> {status}</p>

      {deviceInfo && (
        <div style={{ background: "#eee", padding: 10 }}>
          <p>Serial: {deviceInfo.SerialNo}</p>
          <p>Model: {deviceInfo.Model}</p>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={getInfo}>Get Info</button>
        <button onClick={captureIris}>Capture</button>
        <button onClick={enrollIris}>Enroll</button>
        <button onClick={verifyIris}>Verify</button>
      </div>

      <p>Quality: {quality}</p>

      {irisImage && (
        <img
          src={irisImage}
          width={200}
          alt="iris"
          style={{ border: "1px solid #ccc", marginTop: 10 }}
        />
      )}
    </div>
  );
}