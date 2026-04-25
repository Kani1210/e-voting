"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

// React Icons
import { BsEye, BsEyeFill } from "react-icons/bs";
import { FiZap, FiCamera, FiCheckCircle, FiAlertCircle, FiArrowRight, FiShield, FiActivity } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { RiEyeLine } from "react-icons/ri";

const BASE_URL = "http://localhost:5000";

const STEPS = [
  { num: 1, label: "Get Device", icon: <FiZap size={15} /> },
  { num: 2, label: "Capture",    icon: <FiCamera size={15} /> },
  { num: 3, label: "Enroll",     icon: <FiCheckCircle size={15} /> },
  { num: 4, label: "Verify",     icon: <FiShield size={15} /> },
];

export default function IrisDashboard({ userid }) {
  const router = useRouter();
  const sdkLoaded = useRef(false);
  const [open, setOpen]         = useState(false);
  const [result, setResult]     = useState("");
  const [status, setStatus]     = useState("Loading...");
  const [scanner, setScanner]   = useState(null);
  const [image, setImage]       = useState("");
  const [irisData, setIrisData] = useState("");
  const [quality, setQuality]   = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const getToken = () => localStorage.getItem("token");

  const isError   = status.includes("❌") || status.includes("Failed") || status.includes("Error");
  const isSuccess = status.includes("✔")  || status.includes("Ready")  || status.includes("Connected") || status.includes("Enrolled");

  // ── LOAD SDK ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sdkLoaded.current) return;
    sdkLoaded.current = true;
    const load = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.body.appendChild(s);
      });
    (async () => {
      try {
        await load("https://code.jquery.com/jquery-3.6.0.min.js");
        await load("/marvisauth.js");
        setStatus("SDK Ready ✔ — Click 'Get Device'");
        setCurrentStep(1);
      } catch { setStatus("SDK Load Failed ❌"); }
    })();
  }, []);

  // ── GET DEVICE ──────────────────────────────────────────────────────────────
  const getDevice = () => {
    try {
      const res = window.GetMarvisAuthInfo();
      if (res?.data?.ErrorCode !== "0") { setStatus("Device Not Found ❌ — Check USB"); return; }
      setScanner(res.data.DeviceInfo1?.Model || "Connected");
      setStatus("Device Connected ✔ — Click 'Capture'");
      setCurrentStep(2);
    } catch { setStatus("SDK Not Ready ❌"); }
  };

  // ── CAPTURE ─────────────────────────────────────────────────────────────────
  const capture = () => {
    setImage(""); setIrisData(""); setQuality(null);
    const res = window.CaptureIris(15, 50);
    if (!res?.data || res.data.ErrorCode !== "0") { setStatus("Capture Failed ❌ — Try again"); return; }
    const bmp = res.data.BitmapData;
    setImage("data:image/bmp;base64," + bmp);
    setIrisData(bmp);
    setQuality(parseInt(res.data.Quality));
    setStatus("Captured ✔ — Click 'Enroll' or 'Verify'");
    setCurrentStep(3);
  };

  // ── ENROLL ──────────────────────────────────────────────────────────────────
  const enroll = async () => {
    if (!irisData) { setStatus("No iris data ❌ — Capture first"); return; }
    const token = getToken();
    const res = await fetch(`${BASE_URL}/iris/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ irisImageBase64: irisData }),
    });
    const data = await res.json();
    setStatus(data.success ? "Enrolled ✔" : `Enroll Failed ❌ — ${data.message || ""}`);
  };

  // ── VERIFY ──────────────────────────────────────────────────────────────────
  const verify = async () => {
    if (!irisData) { setStatus("No iris data ❌ — Capture first"); return; }
    const token = getToken();
    if (!token) { setStatus("No token ❌ — Please login again"); router.push("/login"); return; }
    try {
      const res = await fetch(`${BASE_URL}/iris/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ irisImageBase64: irisData }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus(`Auth Failed ❌ (${res.status}) — Token may be expired`); return; }
      if (data.verified) {
        setResult("✔ MATCH SUCCESS"); setStatus("✔ MATCH SUCCESS");
        localStorage.setItem("irisVerified", "true");
        try {
          if (window.StopCapture)    window.StopCapture();
          if (window.StopDevice)     window.StopDevice();
          if (window.ReleaseDevice)  window.ReleaseDevice();
          if (window.DisconnectDevice) window.DisconnectDevice();
          if (window.CloseDevice)    window.CloseDevice();
          setScanner(null); setImage(""); setIrisData(""); setQuality(null);
        } catch (e) { console.log("Device cleanup:", e.message); }
        setCurrentStep(4);
        setOpen(true);
      } else {
        setResult("❌ NOT MATCHED"); setStatus("❌ NOT MATCHED — Try again");
      }
    } catch (err) { setStatus("Network Error: " + err.message); }
  };

  // ── STYLES ──────────────────────────────────────────────────────────────────
  const card = {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 14,
    padding: "18px 22px",
  };

  const actionBtn = (bg, shadow) => ({
    display: "flex", alignItems: "center", gap: 7,
    padding: "9px 18px", borderRadius: 9, border: "none",
    background: bg, color: "#fff",
    fontSize: 13, fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap",
    boxShadow: shadow || "none",
    transition: "opacity .15s, transform .1s",
  });

  const ghostBtn = {
    display: "flex", alignItems: "center", gap: 7,
    padding: "9px 18px", borderRadius: 9,
    background: "transparent",
    border: "1px solid #374151",
    color: "#9ca3af", fontSize: 13, fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap",
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#030712",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 860, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ════ HEADER ════ */}
        <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 13,
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <RiEyeLine size={28} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f9fafb", letterSpacing: "-0.4px" }}>
                Iris Verification
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                Biometric Authentication System
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 14px", borderRadius: 30,
            background: isError ? "#450a0a" : isSuccess ? "#052e16" : "#111827",
            border: `1px solid ${isError ? "#7f1d1d" : isSuccess ? "#14532d" : "#1f2937"}`,
          }}>
            {isError
              ? <FiAlertCircle size={14} color="#f87171" />
              : isSuccess
              ? <HiOutlineStatusOnline size={14} color="#4ade80" />
              : <HiOutlineStatusOnline size={14} color="#6b7280" />
            }
            <span style={{
              fontSize: 12, fontWeight: 500, maxWidth: 280,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              color: isError ? "#f87171" : isSuccess ? "#4ade80" : "#9ca3af",
            }}>
              {status}
            </span>
          </div>
        </div>

        {/* ════ STEP PROGRESS ════ */}
        <div style={{ ...card, padding: "20px 28px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 18 }}>
            Workflow Steps
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((step, i) => {
              const done   = currentStep > step.num;
              const active = currentStep === step.num;
              return (
                <div key={step.num} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: done   ? "#16a34a"
                                : active ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                                : "#1f2937",
                      border: `2px solid ${done ? "#16a34a" : active ? "#9333ea" : "#374151"}`,
                      boxShadow: active ? "0 0 0 4px rgba(168,85,247,.2)" : "none",
                      transition: "all .3s",
                    }}>
                      {done
                        ? <FiCheckCircle size={18} color="#fff" />
                        : <span style={{ color: active ? "#fff" : "#4b5563" }}>{step.icon}</span>
                      }
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: ".3px",
                      color: done ? "#4ade80" : active ? "#d8b4fe" : "#4b5563",
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, margin: "0 6px", marginBottom: 22,
                      borderRadius: 2,
                      background: done ? "linear-gradient(90deg,#16a34a,#7c3aed)" : "#1f2937",
                      transition: "background .4s",
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ════ CONTROLS ════ */}
        <div style={{ ...card }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 }}>
            Controls
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>

            <button onClick={getDevice} style={actionBtn("linear-gradient(135deg,#7c3aed,#9333ea)", "0 0 14px rgba(139,92,246,.3)")}>
              <FiZap size={15} /> Get Device
            </button>

            {/* Device status pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 20,
              background: scanner ? "#052e16" : "#1f2937",
              border: `1px solid ${scanner ? "#14532d" : "#374151"}`,
            }}>
              <BsEye size={13} color={scanner ? "#4ade80" : "#4b5563"} />
              <span style={{ fontSize: 12, fontWeight: 500, color: scanner ? "#4ade80" : "#6b7280" }}>
                {scanner ? `${scanner}` : "No Device"}
              </span>
            </div>

            <button onClick={capture} style={actionBtn("linear-gradient(135deg,#b45309,#d97706)")}>
              <FiCamera size={15} /> Capture
            </button>

            <button onClick={enroll} style={actionBtn("linear-gradient(135deg,#15803d,#16a34a)")}>
              <FiCheckCircle size={15} /> Enroll
            </button>

            <button onClick={verify} style={actionBtn(
              "linear-gradient(135deg,#4f46e5,#6366f1)",
              "0 0 20px rgba(99,102,241,.35)"
            )}>
              <FiShield size={15} /> Verify
            </button>

          </div>
        </div>

        {/* ════ PREVIEW + DATA ════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Iris Scan Preview */}
          <div style={{ ...card }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <BsEyeFill size={15} color="#9333ea" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: ".8px", textTransform: "uppercase" }}>
                Iris Scan
              </span>
            </div>
            <div style={{
              height: 240, borderRadius: 10,
              background: "#0d1117",
              border: "1px dashed #1f2937",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {image
                ? <img src={image} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="iris scan" />
                : (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <RiEyeLine size={52} color="#1f2937" />
                    <span style={{ fontSize: 12, color: "#374151" }}>No scan yet</span>
                  </div>
                )
              }
            </div>
          </div>

          {/* Iris Data */}
          <div style={{ ...card }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FiActivity size={15} color="#9333ea" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: ".8px", textTransform: "uppercase" }}>
                Iris Data
              </span>
              {irisData && (
                <span style={{
                  marginLeft: "auto", fontSize: 10, fontWeight: 700,
                  background: "#052e16", color: "#4ade80",
                  border: "1px solid #14532d",
                  borderRadius: 20, padding: "2px 10px", letterSpacing: ".5px",
                }}>
                  READY
                </span>
              )}
            </div>
            <textarea
              value={irisData}
              readOnly
              placeholder="Iris data will appear here after capture..."
              style={{
                width: "100%", height: quality !== null ? 210 : 240,
                boxSizing: "border-box",
                background: "#0d1117",
                border: "1px solid #1f2937",
                borderRadius: 10, padding: "12px 14px",
                fontSize: 11, color: "#6b7280",
                fontFamily: "'Fira Code', 'Courier New', monospace",
                resize: "none", outline: "none", lineHeight: 1.7,
              }}
            />
            {quality !== null && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginTop: 8, padding: "6px 12px", borderRadius: 8,
                background: quality >= 70 ? "#052e16" : quality >= 40 ? "#1c1408" : "#450a0a",
                border: `1px solid ${quality >= 70 ? "#14532d" : quality >= 40 ? "#713f12" : "#7f1d1d"}`,
              }}>
                <FiActivity size={13} color={quality >= 70 ? "#4ade80" : quality >= 40 ? "#fbbf24" : "#f87171"} />
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: quality >= 70 ? "#4ade80" : quality >= 40 ? "#fbbf24" : "#f87171",
                }}>
                  Quality Score: {quality}
                  <span style={{ fontWeight: 400, color: "#6b7280", marginLeft: 6 }}>
                    {quality >= 70 ? "— Excellent" : quality >= 40 ? "— Acceptable" : "— Poor, retake"}
                  </span>
                </span>
              </div>
            )}
          </div>

        </div>

        {/* ════ FOOTER ════ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 8 }}>
          <FiShield size={11} color="#374151" />
          <span style={{ fontSize: 11, color: "#374151" }}>
            End-to-end encrypted · Biometric data never stored in plain text
          </span>
        </div>

      </div>

      {/* ════ SUCCESS DIALOG ════ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{
          background: "#0d1117",
          border: "1px solid #7c3aed",
          borderRadius: 18,
          boxShadow: "0 0 60px rgba(124,58,237,.25)",
        }}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 13,
                background: "linear-gradient(135deg,#15803d,#16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <MdVerified size={26} color="#fff" />
              </div>
              <DialogTitle style={{ color: "#f9fafb", fontSize: 18, fontWeight: 700 }}>
                Iris Verified
              </DialogTitle>
            </div>
            <DialogDescription style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.7 }}>
              {result} — Identity confirmed! You may now proceed to vote.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ marginTop: 12 }}>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 9, border: "none",
                background: "linear-gradient(135deg,#7c3aed,#9333ea)",
                color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 0 20px rgba(139,92,246,.4)",
              }}
              onClick={() => {
                setOpen(false);
                router.push(`/user/${userid}/success`);
              }}
            >
              <BsEyeFill size={16} />
              Proceed to Vote
              <FiArrowRight size={15} />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}