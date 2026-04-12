"use client";

import { useState, useEffect, useRef } from "react";

const BASE_URL = "http://localhost:5000";

export default function FingerTemplateTest() {
  const [status, setStatus] = useState("Loading...");
  const [sdkReady, setSdkReady] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState("");
  const [templateType, setTemplateType] = useState(0);

  const [fingerImage, setFingerImage] = useState("");
  const [template, setTemplate] = useState("");
  const [busy, setBusy] = useState(false);

  const sdkLoadedRef = useRef(false);

  // ───────── LOAD SDK ─────────
  useEffect(() => {
    if (sdkLoadedRef.current) return;
    sdkLoadedRef.current = true;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });

    const init = async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
        await loadScript("/morfinauth.js");

        setSdkReady(true);
        setStatus("SDK Ready ✔");
      } catch (e) {
        setStatus("SDK Load Failed ❌ " + e.message);
      }
    };

    init();
  }, []);

  // ───────── TOKEN ─────────
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token"); // 🔥 IMPORTANT
  };

  // ───────── DEVICE ─────────
  const getDevices = () => {
    const res = window.GetConnectedDeviceList();

    console.log("DEVICE RESPONSE:", res);

    if (!res?.httpStaus) return setStatus("Device Error ❌");
    if (res.data.ErrorCode !== "0")
      return setStatus(res.data.ErrorDescription);

    const device =
      res.data.ErrorDescription?.split(":")[1]?.split(",")[0];

    setSelectedDevice(device);
    setStatus("Device Selected ✔");
  };

  // ───────── INIT ─────────
  const initDevice = () => {
    const res = window.InitDevice(selectedDevice, "");

    console.log("INIT RESPONSE:", res);

    if (!res?.httpStaus) return setStatus("Init Failed ❌");

    setStatus("Device Ready ✔");
  };

  // ───────── CAPTURE ─────────
  const captureFinger = () => {
    const res = window.CaptureFinger(60, 10);

    console.log("CAPTURE RESPONSE:", res);

    if (!res?.httpStaus) return setStatus("Capture Failed ❌");

    setFingerImage("data:image/bmp;base64," + res.data.BitmapData);

    setStatus("Captured ✔");
  };

  // ───────── TEMPLATE ─────────
  const getTemplate = () => {
    const res = window.GetTemplate(templateType);

    console.log("TEMPLATE RESPONSE:", res);

    if (!res?.httpStaus) return setStatus("Template Error ❌");

    const tpl =
      res.data.TemplateData ||
      res.data.FMRData ||
      res.data.ImgData;

    if (!tpl) return setStatus("Template Not Found ❌");

    setTemplate(tpl);
    setStatus("Template Ready ✔");
  };

  // ───────── SAVE TO BACKEND (FIXED TOKEN) ─────────
  const saveToDB = async () => {
    if (!template) return setStatus("No Template ❌");

    const token = getToken();
    if (!token) return setStatus("Login required ❌ No token");

    setBusy(true);
    setStatus("Saving...");

    try {
      const res = await fetch(`${BASE_URL}/users/add-finger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 THIS FIXES 401
        },
        body: JSON.stringify({
          template, // MUST MATCH BACKEND
        }),
      });

      const data = await res.json();

      console.log("BACKEND RESPONSE:", data);

      if (data.success) {
        setStatus("Saved ✔ Fingerprint stored");
        setTemplate("");
        setFingerImage("");
      } else {
        setStatus(data.message || "Save Failed ❌");
      }
    } catch (e) {
      setStatus("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Fingerprint LOCAL + BACKEND FIXED</h2>

      <p>SDK: {sdkReady ? "READY ✔" : "LOADING..."}</p>
      <p>Status: {status}</p>

      <button onClick={getDevices}>Get Devices</button>
      <button onClick={initDevice}>Init</button>
      <button onClick={captureFinger}>Capture</button>

      {fingerImage && <img src={fingerImage} width={120} />}

      <button onClick={getTemplate}>Get Template</button>

      <button onClick={saveToDB} disabled={!template || busy}>
        {busy ? "Saving..." : "Save to Backend"}
      </button>

      <div style={{ fontSize: 10, wordBreak: "break-all" }}>
        {template?.slice(0, 120)}
      </div>
    </div>
  );
}