"use client";

/**
 * IrisDashboard.jsx
 * =================
 * Complete iris enroll + verify UI.
 *
 * KEY CHANGE FROM PREVIOUS VERSION
 * ─────────────────────────────────
 * User EXPLICITLY selects "Left Eye" or "Right Eye" before enrolling or verifying.
 * This eye_side is sent to the backend so:
 *   1. Python mirror-flips right-eye images → left and right produce DIFFERENT vectors
 *   2. Express hard-rejects if enrolled eye ≠ presented eye
 *
 * This removes all reliance on unreliable Hough circle position detection.
 *
 * Setup:
 *   • Copy marvisauth.js into /public/
 *   • Set NEXT_PUBLIC_API_URL in Vercel env vars
 */

import { useEffect, useRef, useState, useCallback } from "react";

const BASE_URL        = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const MIN_ENROLL_QUAL = 65;
const MIN_VERIFY_QUAL = 50;

export default function IrisDashboard({ userid }) {
  const sdkReady = useRef(false);

  const [sdkLoaded,    setSdkLoaded]    = useState(false);
  const [deviceInfo,   setDeviceInfo]   = useState(null);
  const [status,       setStatus]       = useState({ msg: "Loading SDK...", type: "info" });
  const [selectedEye,  setSelectedEye]  = useState("left");   // user's choice
  const [enrolledEye,  setEnrolledEye]  = useState(null);     // what is stored in DB
  const [irisImage,    setIrisImage]    = useState("");
  const [irisBase64,   setIrisBase64]   = useState("");
  const [quality,      setQuality]      = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading,      setLoading]      = useState(false);

  const setMsg = useCallback((msg, type = "info") => setStatus({ msg, type }), []);
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ── Load Mantra SDK ────────────────────────────────────────────────────────
  useEffect(() => {
    if (sdkReady.current) return;
    sdkReady.current = true;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.body.appendChild(s);
      });

    (async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
        await loadScript("/marvisauth.js");
        setSdkLoaded(true);
        setMsg("SDK loaded — click Get Device Info to confirm scanner is connected", "success");
      } catch {
        setMsg("SDK load failed — make sure marvisauth.js is in /public folder", "error");
      }
    })();
  }, [setMsg]);


  // ── Get device info ────────────────────────────────────────────────────────
  const getDeviceInfo = () => {
    if (!sdkLoaded) return setMsg("SDK not loaded yet", "error");
    try {
      const res = window.GetMarvisAuthInfo();
      if (res?.data?.ErrorCode === "0") {
        setDeviceInfo(res.data.DeviceInfo1);
        setMsg("Scanner connected and ready", "success");
      } else {
        setDeviceInfo(null);
        setMsg(
          `Scanner not found (code ${res?.data?.ErrorCode ?? "?"}) — ` +
          "check USB cable and Mantra service is running",
          "error"
        );
      }
    } catch {
      setMsg("SDK error — is the Mantra SDK service running on this machine?", "error");
    }
  };


  // ── Capture from scanner ───────────────────────────────────────────────────
  const doCapture = (minQual) => {
    const res = window.CaptureIris(15, minQual);
    if (!res?.data)                        return { ok: false, reason: "No response from scanner" };
    if (res.data.ErrorCode !== "0")        return { ok: false, reason: `Error code ${res.data.ErrorCode}` };
    return { ok: true, bmp: res.data.BitmapData, quality: parseInt(res.data.Quality, 10) };
  };


  // ── Enroll ─────────────────────────────────────────────────────────────────
  const enrollIris = async () => {
    const token = getToken();
    if (!token)     return setMsg("Not logged in", "error");
    if (!sdkLoaded) return setMsg("SDK not loaded", "error");

    setLoading(true);
    setVerifyResult(null);
    setIrisImage("");
    setIrisBase64("");
    setQuality(null);

    setMsg(
      `Enrolling ${selectedEye} eye — look straight into the scanner and hold still`,
      "info"
    );

    try {
      const r = doCapture(MIN_ENROLL_QUAL);
      if (!r.ok) { setMsg(`Capture failed — ${r.reason}`, "error"); return; }

      if (r.quality < MIN_ENROLL_QUAL) {
        setMsg(
          `Quality ${r.quality} too low for enrollment (need ${MIN_ENROLL_QUAL}+). ` +
          "Move closer to the scanner and try again.",
          "error"
        );
        return;
      }

      setIrisBase64(r.bmp);
      setIrisImage("data:image/bmp;base64," + r.bmp);
      setQuality(r.quality);
      setMsg("Good capture — saving to server...", "info");

      const res = await fetch(`${BASE_URL}/iris/add`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ irisImage: r.bmp, eye_side: selectedEye }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEnrolledEye(data.eye_side);
        setMsg(
          `${selectedEye.toUpperCase()} eye enrolled successfully. ` +
          `Always use your ${selectedEye} eye when verifying.`,
          "success"
        );
      } else {
        setMsg(data.message || data.error || "Enroll failed", "error");
      }
    } catch {
      setMsg("Cannot reach backend — check Render service", "error");
    } finally {
      setLoading(false);
    }
  };


  // ── Verify ─────────────────────────────────────────────────────────────────
  const verifyIris = async () => {
    const token = getToken();
    if (!token)     return setMsg("Not logged in", "error");
    if (!sdkLoaded) return setMsg("SDK not loaded", "error");

    setLoading(true);
    setVerifyResult(null);
    setIrisImage("");
    setIrisBase64("");
    setQuality(null);

    setMsg(`Verifying ${selectedEye} eye — look into the scanner`, "info");

    try {
      const r = doCapture(MIN_VERIFY_QUAL);
      if (!r.ok) { setMsg(`Capture failed — ${r.reason}`, "error"); return; }

      setIrisBase64(r.bmp);
      setIrisImage("data:image/bmp;base64," + r.bmp);
      setQuality(r.quality);
      setMsg(`Captured (quality ${r.quality}) — verifying...`, "info");

      const res = await fetch(`${BASE_URL}/iris/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ irisImage: r.bmp, eye_side: selectedEye }),
      });

      const data = await res.json();
      setVerifyResult(data);

      if (data.verified) {
        setMsg("Identity verified", "success");
      } else {
        setMsg(data.message || "Iris does not match", "error");
      }
    } catch {
      setMsg("Cannot reach backend — check network", "error");
    } finally {
      setLoading(false);
    }
  };


  // ── Styles ─────────────────────────────────────────────────────────────────
  const statusBg = {
    info:    { background: "#0d2137", color: "#90caf9", border: "1px solid #1565c0" },
    success: { background: "#0d2818", color: "#a5d6a7", border: "1px solid #2e7d32" },
    error:   { background: "#2d0a0a", color: "#ef9a9a", border: "1px solid #c62828" },
  };

  const eyeBtn = (side) => ({
    flex:         1,
    padding:      "10px 0",
    background:   selectedEye === side ? (side === "left" ? "#1a237e" : "#4a148c") : "#1a1a1a",
    color:        selectedEye === side ? "#fff" : "#666",
    border:       `2px solid ${selectedEye === side ? (side === "left" ? "#3949ab" : "#7b1fa2") : "#333"}`,
    borderRadius: 8,
    cursor:       "pointer",
    fontWeight:   "bold",
    fontSize:     14,
    transition:   "all 0.15s",
  });

  const actionBtn = (color) => ({
    flex:         1,
    padding:      "11px 0",
    background:   loading ? "#1a1a1a" : color,
    color:        loading ? "#444" : "#fff",
    border:       "none",
    borderRadius: 8,
    cursor:       loading ? "not-allowed" : "pointer",
    fontWeight:   "bold",
    fontSize:     13,
    transition:   "background 0.15s",
  });

  const eyePill = (side) => (
    side && side !== "unknown"
      ? <span style={{
          display:      "inline-block",
          padding:      "2px 10px",
          borderRadius: 12,
          fontSize:     11,
          fontWeight:   "bold",
          background:   side === "left" ? "#1a237e" : "#4a148c",
          color:        "#fff",
          marginLeft:   6,
        }}>
          {side.toUpperCase()} EYE
        </span>
      : null
  );


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      padding: 24, maxWidth: 500, margin: "0 auto",
      background: "#0e0e0e", borderRadius: 14,
      color: "#fff", fontFamily: "system-ui, sans-serif",
    }}>

      {/* Header */}
      <h2 style={{ margin: "0 0 2px", fontSize: 20 }}>Iris Verification</h2>
      <p style={{ color: "#555", fontSize: 12, margin: "0 0 18px" }}>User: {userid}</p>

      {/* Status */}
      <div style={{
        padding: "11px 14px", borderRadius: 8,
        marginBottom: 18, fontSize: 13, lineHeight: 1.5,
        ...statusBg[status.type],
      }}>
        {status.msg}
      </div>

      {/* Device info */}
      {deviceInfo && (
        <div style={{
          background: "#111", border: "1px solid #222",
          padding: "7px 12px", borderRadius: 8,
          marginBottom: 14, fontSize: 11, color: "#4fc3f7",
        }}>
          Scanner: {JSON.stringify(deviceInfo)}
        </div>
      )}

      {/* ── Step 1: Select eye ── */}
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px", fontWeight: "bold", letterSpacing: 1 }}>
        STEP 1 — SELECT EYE TO SCAN
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button style={eyeBtn("left")}  onClick={() => setSelectedEye("left")}  disabled={loading}>
          Left Eye
        </button>
        <button style={eyeBtn("right")} onClick={() => setSelectedEye("right")} disabled={loading}>
          Right Eye
        </button>
      </div>

      {enrolledEye && enrolledEye !== "unknown" && (
        <p style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
          Enrolled eye in DB: {eyePill(enrolledEye)}
          {selectedEye !== enrolledEye && (
            <span style={{ color: "#ef9a9a", marginLeft: 8 }}>
              ⚠ You enrolled your {enrolledEye} eye — please switch to {enrolledEye}
            </span>
          )}
        </p>
      )}

      {/* ── Step 2: Device + actions ── */}
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px", fontWeight: "bold", letterSpacing: 1 }}>
        STEP 2 — ACTION
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <button
          style={{ ...actionBtn("#0277bd"), flex: "none", padding: "11px 14px" }}
          onClick={getDeviceInfo} disabled={loading}
        >
          Get Device Info
        </button>
        <button style={actionBtn("#1565c0")} onClick={enrollIris}  disabled={loading}>
          Enroll {selectedEye === "left" ? "Left" : "Right"} Eye
        </button>
        <button style={actionBtn("#2e7d32")} onClick={verifyIris}  disabled={loading}>
          Verify {selectedEye === "left" ? "Left" : "Right"} Eye
        </button>
      </div>

      {/* Quality bar */}
      {quality !== null && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 4 }}>
            <span>Scan quality</span>
            <span style={{
              fontWeight: "bold",
              color: quality >= 65 ? "#a5d6a7" : quality >= 50 ? "#ffe082" : "#ef9a9a",
            }}>
              {quality}
              {quality < 50  && " — too low, retake"}
              {quality >= 50 && quality < 65 && " — ok for verify"}
              {quality >= 65 && " — good"}
            </span>
          </div>
          <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.min(quality, 100)}%`, borderRadius: 3,
              background: quality >= 65 ? "#4caf50" : quality >= 50 ? "#ffc107" : "#f44336",
              transition: "width 0.4s",
            }} />
          </div>
        </div>
      )}

      {/* Iris preview */}
      {irisImage && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: "#444", fontSize: 11, marginBottom: 6 }}>
            Captured iris ({selectedEye} eye):
          </p>
          <img src={irisImage} width={180} alt="iris"
            style={{ borderRadius: 8, border: "2px solid #222", display: "block" }} />
        </div>
      )}

      {/* Verify result */}
      {verifyResult && (
        <div style={{
          padding: 16, borderRadius: 10, marginBottom: 14,
          background: verifyResult.verified ? "#0d2818" : "#2d0a0a",
          border: `1px solid ${verifyResult.verified ? "#2e7d32" : "#c62828"}`,
        }}>
          <p style={{ fontWeight: "bold", fontSize: 18, margin: "0 0 10px" }}>
            {verifyResult.verified ? "IDENTITY VERIFIED" : "NOT MATCHED"}
          </p>

          {/* Eye info row */}
          <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 8px" }}>
            Enrolled: {eyePill(verifyResult.enrolled_eye)}
            &nbsp;&nbsp;
            Scanned: {eyePill(verifyResult.presented_eye)}
          </p>

          {/* Metrics — only shown when vector comparison ran */}
          {verifyResult.distance != null && (
            <div style={{ fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#aaa" }}>
                  Distance (pass if &lt; {verifyResult.distanceThreshold})
                </span>
                <span style={{
                  fontWeight: "bold",
                  color: verifyResult.distance < verifyResult.distanceThreshold ? "#a5d6a7" : "#ef9a9a",
                }}>
                  {verifyResult.distance}
                  {verifyResult.distance < verifyResult.distanceThreshold ? " ✓" : " ✗"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#aaa" }}>
                  Similarity (pass if &gt; {(verifyResult.similarityThreshold * 100).toFixed(0)}%)
                </span>
                <span style={{
                  fontWeight: "bold",
                  color: verifyResult.similarity > verifyResult.similarityThreshold ? "#a5d6a7" : "#ef9a9a",
                }}>
                  {(verifyResult.similarity * 100).toFixed(1)}%
                  {verifyResult.similarity > verifyResult.similarityThreshold ? " ✓" : " ✗"}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          {verifyResult.message && (
            <p style={{ fontSize: 12, color: "#bbb", margin: "10px 0 0" }}>
              {verifyResult.message}
            </p>
          )}
        </div>
      )}

      {/* Debug */}
      {irisBase64 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ color: "#333", cursor: "pointer", fontSize: 11 }}>Raw base64</summary>
          <textarea readOnly value={irisBase64} style={{
            width: "100%", height: 55, marginTop: 6,
            background: "#111", color: "#333",
            border: "1px solid #222", borderRadius: 4,
            fontSize: 10, resize: "none",
          }} />
        </details>
      )}
    </div>
  );
}