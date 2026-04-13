"use client";

import { useEffect, useRef, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function IrisSystem() {
  const [status, setStatus] = useState("Loading...");
  const [deviceInfo, setDeviceInfo] = useState(null);

  const [imageType, setImageType] = useState("1"); // BMP default
  const [irisImage, setIrisImage] = useState("");
  const [irisBase64, setIrisBase64] = useState("");
  const [quality, setQuality] = useState("");

  const sdkLoaded = useRef(false);

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
        script.onerror = reject;
        document.body.appendChild(script);
      });

    const init = async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
        await loadScript("/marvisauth.js"); // put in public folder
        setStatus("SDK Ready ✔");
      } catch {
        setStatus("SDK Load Failed ❌");
      }
    };

    init();
  }, []);

  /* ---------------- GET DEVICE INFO ---------------- */
  const getInfo = () => {
    try {
      const res = window.GetMarvisAuthInfo();

      if (!res?.httpStaus) {
        setStatus("Device Error ❌");
        return;
      }

      if (res.data.ErrorCode === "0") {
        setDeviceInfo(res.data.DeviceInfo1);
        setStatus("Device Connected ✔");
      } else {
        setStatus(res.data.ErrorDescription);
      }
    } catch (e) {
      setStatus("SDK Not Ready ❌");
    }
  };

  /* ---------------- CAPTURE IRIS ---------------- */
  const captureIris = () => {
    try {
      const timeout = 15;
      const q = 55;

      const res = window.CaptureIris(timeout, q);

      if (!res?.httpStaus) {
        setStatus("Capture Failed ❌");
        return;
      }

      const data = res.data;

      if (data.ErrorCode === "0") {
        setStatus("Capture Success ✔");

        setIrisBase64(data.BitmapData);
        setQuality(data.Quality);

        setIrisImage("data:image/bmp;base64," + data.BitmapData);
      } else {
        setStatus(data.ErrorDescription);
      }
    } catch (e) {
      setStatus("Error: SDK not ready");
    }
  };

  /* ---------------- SAVE TO BACKEND ---------------- */
  const saveToBackend = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/users/iris/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        irisTemplate: irisBase64,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus("Saved to DB ✔");
    } else {
      setStatus("Save Failed ❌");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>👁 IRIS SYSTEM (React + SDK + Local API)</h2>

      <p><b>Status:</b> {status}</p>

      {/* DEVICE INFO */}
      {deviceInfo && (
        <div style={{ background: "#eee", padding: 10, marginBottom: 10 }}>
          <p>Serial: {deviceInfo.SerialNo}</p>
          <p>Make: {deviceInfo.Make}</p>
          <p>Model: {deviceInfo.Model}</p>
          <p>Width: {deviceInfo.Width}</p>
          <p>Height: {deviceInfo.Height}</p>
        </div>
      )}

      {/* IMAGE TYPE */}
      <div style={{ marginBottom: 10 }}>
        <label>Image Type: </label>
        <select value={imageType} onChange={(e) => setImageType(e.target.value)}>
          <option value="1">BMP</option>
          <option value="2">Raw</option>
          <option value="3">K3</option>
          <option value="4">K7</option>
        </select>
      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button onClick={getInfo}>Get Info</button>
        <button onClick={captureIris}>Capture Iris</button>
        <button onClick={saveToBackend}>Save (Local API)</button>
      </div>

      {/* QUALITY */}
      {quality && <p>Quality: {quality}</p>}

      {/* IMAGE */}
      {irisImage && (
        <img
          src={irisImage}
          alt="iris"
          width={200}
          style={{ border: "1px solid #ccc" }}
        />
      )}

      {/* BASE64 */}
      <textarea
        value={irisBase64}
        readOnly
        style={{ width: "100%", height: 120, marginTop: 10 }}
      />
    </div>
  );
}