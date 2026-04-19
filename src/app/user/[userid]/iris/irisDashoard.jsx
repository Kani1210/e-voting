"use client";

/**
 * IrisDashboard.jsx — Simple, No Eye Side
 * ========================================
 * Buttons: Refresh Scanner | Capture | Enroll | Verify
 * No left/right eye selection.
 * Python only — no .NET bridge.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const BASE_URL        = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const MIN_ENROLL_QUAL = 65;
const MIN_VERIFY_QUAL = 50;

export default function IrisDashboard({ userid }) {
  const router   = useRouter();
  const sdkReady = useRef(false);

  const [sdkLoaded,    setSdkLoaded]    = useState(false);
  const [scannerModel, setScannerModel] = useState(null);
  const [status,       setStatus]       = useState({ msg: "Initializing scanner SDK...", type: "info" });
  const [irisImage,    setIrisImage]    = useState("");   // preview
  const [capturedBmp,  setCapturedBmp]  = useState("");   // raw base64 for send
  const [quality,      setQuality]      = useState(null);
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [activeBtn,    setActiveBtn]    = useState(null); // which button is working

  const setMsg   = useCallback((msg, type = "info") => setStatus({ msg, type }), []);
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;


  // ── Load SDK ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sdkReady.current) return;
    sdkReady.current = true;

    const load = (src) => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.body.appendChild(s);
    });

    (async () => {
      try {
        await load("https://code.jquery.com/jquery-3.6.0.min.js");
        await load("/marvisauth.js");
        setSdkLoaded(true);
        setMsg("SDK ready — click Refresh Scanner to connect", "success");
      } catch {
        setMsg("SDK failed to load — ensure marvisauth.js is in /public/", "error");
      }
    })();
  }, [setMsg]);


  // ── Refresh Scanner ───────────────────────────────────────────────────────
  const refreshScanner = () => {
    if (!sdkLoaded) return setMsg("SDK not loaded yet", "error");
    try {
      const r = window.GetMarvisAuthInfo();
      if (r?.data?.ErrorCode === "0") {
        setScannerModel(r.data.DeviceInfo1?.Model || "Connected");
        setMsg("Scanner connected and ready", "success");
      } else {
        setScannerModel(null);
        setMsg(
          `Scanner not found (code ${r?.data?.ErrorCode ?? "?"}) — ` +
          "check USB and ensure Mantra SDK service is running",
          "error"
        );
      }
    } catch {
      setMsg("SDK error — is Mantra service running on port 8031?", "error");
    }
  };


  // ── Capture ───────────────────────────────────────────────────────────────
  const captureIris = (minQual = MIN_VERIFY_QUAL) => {
    let r;
    try { r = window.CaptureIris(15, minQual); }
    catch (e) { return { ok: false, reason: `SDK exception: ${e.message}` }; }

    if (!r?.data)
      return { ok: false, reason: "No response from scanner" };
    if (r.data.ErrorCode !== "0")
      return { ok: false, reason: `Scanner error ${r.data.ErrorCode}: ${r.data.ErrorDescription || ""}` };

    const bmp = r.data.BitmapData || r.data.ImageData || r.data.Data || null;
    if (!bmp)
      return { ok: false, reason: `No image in response. Fields: [${Object.keys(r.data).join(", ")}]` };

    return { ok: true, bmp, quality: parseInt(r.data.Quality, 10) || 0 };
  };


  // ── CAPTURE button ────────────────────────────────────────────────────────
  const handleCapture = () => {
    if (!sdkLoaded) return setMsg("SDK not loaded", "error");
    if (loading)    return;

    setResult(null);
    setMsg("Look straight into scanner — capturing...", "info");

    const r = captureIris(MIN_VERIFY_QUAL);
    if (!r.ok) {
      setMsg(`Capture failed — ${r.reason}`, "error");
      return;
    }

    setCapturedBmp(r.bmp);
    setIrisImage("data:image/bmp;base64," + r.bmp);
    setQuality(r.quality);
    setMsg(`Captured — quality ${r.quality}. Click Enroll or Verify.`, "success");
  };


  // ── ENROLL button ─────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    const token = getToken();
    if (!token)      return setMsg("Not logged in", "error");
    if (!capturedBmp) return setMsg("Capture iris first", "error");
    if (loading)     return;

    if (quality < MIN_ENROLL_QUAL) {
      setMsg(`Quality ${quality} too low for enroll (need ${MIN_ENROLL_QUAL}+). Capture again.`, "error");
      return;
    }

    setLoading(true);
    setActiveBtn("enroll");
    setMsg("Enrolling iris — saving to server...", "info");

    try {
      const bodyStr = JSON.stringify({ irisImageBase64: capturedBmp });
      const res     = await fetch(`${BASE_URL}/iris/add`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    bodyStr,
      });

      const rawText = await res.text();
      console.log("[ENROLL] Server:", rawText);

      let data;
      try { data = JSON.parse(rawText); }
      catch { setMsg(`Server error ${res.status}: ${rawText.substring(0, 80)}`, "error"); return; }

      if (res.ok && data.success) {
        setMsg("Iris enrolled successfully. You can now verify.", "success");
      } else {
        setMsg(`Enroll failed — ${data.message || data.error || `HTTP ${res.status}`}`, "error");
      }
    } catch (err) {
      setMsg(`Network error — ${err.message}`, "error");
    } finally {
      setLoading(false);
      setActiveBtn(null);
    }
  };


  // ── VERIFY button ─────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const token = getToken();
    if (!token)       return setMsg("Not logged in", "error");
    if (!capturedBmp) return setMsg("Capture iris first", "error");
    if (loading)      return;

    setLoading(true);
    setActiveBtn("verify");
    setResult(null);
    setMsg("Verifying iris...", "info");

    try {
      const res = await fetch(`${BASE_URL}/iris/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ irisImageBase64: capturedBmp }),
      });

      const rawText = await res.text();
      console.log("[VERIFY] Server:", rawText);

      let data;
      try { data = JSON.parse(rawText); }
      catch { setMsg(`Server error ${res.status}: ${rawText.substring(0, 80)}`, "error"); return; }

      setResult(data);

      if (data.verified) {
        setMsg("Identity verified successfully!", "success");
        setTimeout(() => router.push(`/user/${userid}/finger`), 1500);
      } else {
        setMsg(data.message || "Iris did not match", "error");
      }
    } catch (err) {
      setMsg(`Network error — ${err.message}`, "error");
    } finally {
      setLoading(false);
      setActiveBtn(null);
    }
  };


  // ── Helpers ───────────────────────────────────────────────────────────────
  const scoreColor = (s) =>
    s > SIMILARITY_THRESHOLD * 100 ? "#22c55e" : s > 60 ? "#f59e0b" : "#ef4444";

  const SIMILARITY_THRESHOLD = 0.85;


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 50%, #0f172a 0%, #020617 60%, #0f0a1e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 14px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 0 40px rgba(99,102,241,0.35)",
          }}>
            👁
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>
            Iris Verification
          </h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
            User: <span style={{ color: "#94a3b8" }}>{userid}</span>
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(15,23,42,0.85)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 20, padding: 24,
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}>

          {/* Status */}
          <div style={{
            padding: "12px 16px", borderRadius: 12, marginBottom: 20,
            fontSize: 13, lineHeight: 1.5,
            display: "flex", alignItems: "flex-start", gap: 10,
            ...(status.type === "success"
              ? { background: "rgba(34,197,94,0.1)",  color: "#86efac", border: "1px solid rgba(34,197,94,0.25)" }
              : status.type === "error"
              ? { background: "rgba(239,68,68,0.1)",  color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }
              : { background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }
            ),
          }}>
            <span style={{ flexShrink: 0 }}>
              {status.type === "success" ? "✓" : status.type === "error" ? "✕" : "◈"}
            </span>
            {status.msg}
          </div>

          {/* Scanner row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 10, marginBottom: 20,
            background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: scannerModel ? "#22c55e" : "#475569",
              boxShadow: scannerModel ? "0 0 8px #22c55e" : "none",
            }} />
            <span style={{ color: "#94a3b8", fontSize: 12, flex: 1 }}>
              {scannerModel ? `Scanner: ${scannerModel}` : "Scanner not connected"}
            </span>
            <button
              onClick={refreshScanner}
              disabled={loading}
              style={{
                padding: "4px 14px", borderRadius: 6,
                border: "1px solid rgba(99,102,241,0.4)",
                background: "transparent", color: "#818cf8",
                fontSize: 11, cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {/* 4 Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>

            {/* Capture */}
            <button
              onClick={handleCapture}
              disabled={loading || !sdkLoaded}
              style={{
                gridColumn: "1 / -1",
                padding: "14px 0", borderRadius: 12, border: "none",
                fontWeight: 700, fontSize: 14,
                cursor: loading || !sdkLoaded ? "not-allowed" : "pointer",
                background: loading || !sdkLoaded
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, #1e3a5f, #2563eb)",
                color: loading || !sdkLoaded ? "#334155" : "#dbeafe",
                boxShadow: !loading && sdkLoaded ? "0 4px 20px rgba(37,99,235,0.25)" : "none",
                transition: "all 0.2s",
              }}
            >
              📷&nbsp; Capture Iris
            </button>

            {/* Enroll */}
            <button
              onClick={handleEnroll}
              disabled={loading || !capturedBmp}
              style={{
                padding: "13px 0", borderRadius: 12, border: "none",
                fontWeight: 700, fontSize: 13,
                cursor: loading || !capturedBmp ? "not-allowed" : "pointer",
                background: loading || !capturedBmp
                  ? "rgba(255,255,255,0.04)"
                  : activeBtn === "enroll"
                  ? "linear-gradient(135deg, #3730a3, #4338ca)"
                  : "linear-gradient(135deg, #3730a3, #4f46e5)",
                color: loading || !capturedBmp ? "#334155" : "#e0e7ff",
                boxShadow: !loading && capturedBmp ? "0 4px 16px rgba(79,70,229,0.25)" : "none",
                transition: "all 0.2s",
              }}
            >
              {activeBtn === "enroll" ? "Enrolling..." : "✦ Enroll"}
            </button>

            {/* Verify */}
            <button
              onClick={handleVerify}
              disabled={loading || !capturedBmp}
              style={{
                padding: "13px 0", borderRadius: 12, border: "none",
                fontWeight: 700, fontSize: 13,
                cursor: loading || !capturedBmp ? "not-allowed" : "pointer",
                background: loading || !capturedBmp
                  ? "rgba(255,255,255,0.04)"
                  : activeBtn === "verify"
                  ? "linear-gradient(135deg, #064e3b, #047857)"
                  : "linear-gradient(135deg, #064e3b, #059669)",
                color: loading || !capturedBmp ? "#334155" : "#d1fae5",
                boxShadow: !loading && capturedBmp ? "0 4px 16px rgba(5,150,105,0.25)" : "none",
                transition: "all 0.2s",
              }}
            >
              {activeBtn === "verify" ? "Verifying..." : "✔ Verify"}
            </button>

          </div>

          {/* Quality bar */}
          {quality !== null && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>Scan quality</span>
                <span style={{
                  fontWeight: 700,
                  color: quality >= 65 ? "#22c55e" : quality >= 50 ? "#f59e0b" : "#ef4444",
                }}>
                  {quality} / 100
                  {quality < 50  ? " — too low, capture again"
                  : quality < 65 ? " — acceptable"
                  :               " — good"}
                </span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3, transition: "width 0.5s",
                  width: `${Math.min(quality, 100)}%`,
                  background: quality >= 65
                    ? "linear-gradient(90deg,#16a34a,#22c55e)"
                    : quality >= 50
                    ? "linear-gradient(90deg,#d97706,#f59e0b)"
                    : "linear-gradient(90deg,#dc2626,#ef4444)",
                }} />
              </div>
            </div>
          )}

          {/* Iris preview */}
          {irisImage && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ color: "#475569", fontSize: 11, marginBottom: 8 }}>Captured iris:</p>
              <img
                src={irisImage}
                width={160}
                alt="iris"
                style={{ borderRadius: 10, border: "2px solid rgba(99,102,241,0.3)", display: "block" }}
              />
            </div>
          )}

          {/* Result card */}
          {result && (
            <div style={{
              padding: 16, borderRadius: 14,
              background: result.verified ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${result.verified ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: result.verified ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                  fontSize: 18,
                }}>
                  {result.verified ? "✓" : "✕"}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: result.verified ? "#86efac" : "#fca5a5" }}>
                    {result.verified ? "Identity Verified" : "Not Matched"}
                  </p>
                  {result.verified && (
                    <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0" }}>
                      Redirecting...
                    </p>
                  )}
                </div>
              </div>

              {/* Metrics */}
              {result.distance != null && (
                <div style={{ fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#64748b" }}>
                      Distance (pass if {"<"} {result.distanceThreshold})
                    </span>
                    <span style={{ fontWeight: 700, color: result.distance < result.distanceThreshold ? "#86efac" : "#fca5a5" }}>
                      {result.distance} {result.distance < result.distanceThreshold ? "✓" : "✗"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>
                      Similarity (pass if {">"} {(result.similarityThreshold * 100).toFixed(0)}%)
                    </span>
                    <span style={{ fontWeight: 700, color: result.similarity > result.similarityThreshold ? "#86efac" : "#fca5a5" }}>
                      {(result.similarity * 100).toFixed(1)}% {result.similarity > result.similarityThreshold ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              )}

              {result.message && (
                <p style={{ fontSize: 12, color: "#64748b", margin: "10px 0 0", lineHeight: 1.5 }}>
                  {result.message}
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}