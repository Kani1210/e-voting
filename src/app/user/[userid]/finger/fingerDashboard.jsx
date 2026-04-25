"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// React Icons
import { MdFingerprint, MdDeviceHub, MdVerified } from "react-icons/md";
import { FiZap, FiCamera, FiFileText, FiSave, FiCheckCircle, FiArrowRight, FiAlertCircle, FiShield } from "react-icons/fi";
import { BsEye } from "react-icons/bs";
import { HiOutlineStatusOnline } from "react-icons/hi";

const BASE_URL = "http://localhost:5000";

const STEPS = [
  { num: 1, label: "Devices",   icon: <MdDeviceHub size={15} /> },
  { num: 2, label: "Init",      icon: <FiZap size={15} /> },
  { num: 3, label: "Capture",   icon: <FiCamera size={15} /> },
  { num: 4, label: "Template",  icon: <FiFileText size={15} /> },
  { num: 5, label: "Verify",    icon: <FiCheckCircle size={15} /> },
];

export default function FingerprintDashboard({ userid }) {
  const [status, setStatus]               = useState("Loading...");
  const [currentStep, setCurrentStep]     = useState(0);
  const router                            = useRouter();
  const [devices, setDevices]             = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [open, setOpen]                   = useState(false);
  const [result, setResult]               = useState("");
  const [template, setTemplate]           = useState("");
  const [image, setImage]                 = useState("");
  const sdkLoaded                         = useRef(false);
  const getToken = () => localStorage.getItem("token");

  const isError   = status.includes("❌") || status.includes("Failed") || status.includes("Error");
  const isSuccess = status.includes("✔")  || status.includes("Ready")  || status.includes("Found") || status.includes("Saved");

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
    const init = async () => {
      try {
        await load("https://code.jquery.com/jquery-3.6.0.min.js");
        await load("/morfinauth.js");
        try { if (window.UninitDevice) window.UninitDevice(); } catch (e) { console.log("Uninit on load:", e.message); }
        setStatus("SDK Ready ✔ — Click 'Devices' to start");
        setCurrentStep(1);
      } catch { setStatus("SDK Load Failed ❌"); }
    };
    init();
  }, []);

  // ── GET DEVICES ─────────────────────────────────────────────────────────────
  const getDevices = () => {
    try {
      const res = window.GetConnectedDeviceList();
      if (!res?.httpStaus || res.data.ErrorCode != 0) { setStatus("Device Error ❌ — Check USB connection"); return; }
      const raw  = res.data.ErrorDescription;
      const list = raw.split(":")[1].split(",").map((d) => d.trim());
      setDevices(list); setSelectedDevice(list[0]);
      setStatus("Devices Found ✔ — Click 'Init' next");
      setCurrentStep(2);
    } catch { setStatus("SDK Not Ready ❌"); }
  };

  // ── INIT DEVICE ─────────────────────────────────────────────────────────────
  const initDevice = () => {
    if (!selectedDevice) { setStatus("No device selected ❌"); return; }
    const res = window.InitDevice(selectedDevice, "");
    if (!res?.httpStaus || res.data.ErrorCode != 0) { setStatus("Init Failed ❌"); return; }
    setStatus("Device Ready ✔ — Click 'Capture' now");
    setCurrentStep(3);
  };

  // ── CAPTURE ─────────────────────────────────────────────────────────────────
  const capture = () => {
    setImage(""); setTemplate("");
    const res = window.CaptureFinger(60, 10);
    if (!res?.httpStaus || res.data.ErrorCode != 0) { setStatus("Capture Failed ❌ — Try again"); return; }
    setImage("data:image/bmp;base64," + res.data.BitmapData);
    setStatus("Captured ✔ — Click 'Get Template' next");
    setCurrentStep(4);
  };

  // ── GET TEMPLATE ────────────────────────────────────────────────────────────
  const getTemplate = () => {
    const res = window.GetTemplate(0);
    if (!res?.httpStaus || res.data.ErrorCode != 0) { setStatus("Template Error ❌"); return; }
    const tpl = res.data.TemplateData || res.data.FMRData || res.data.ImgData;
    setTemplate(tpl.trim());
    setStatus("Template Ready ✔ — Click 'Save' or 'Verify'");
    setCurrentStep(5);
  };

  // ── SAVE ────────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!template) { setStatus("No template to save ❌"); return; }
    const token = getToken();
    const res   = await fetch(`${BASE_URL}/fingerprint/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ template }),
    });
    const data = await res.json();
    setStatus(data.success ? "Saved ✔" : "Save Failed ❌");
  };

  // ── VERIFY ──────────────────────────────────────────────────────────────────
  const verify = async () => {
    const token = localStorage.getItem("token");
    if (!token)    { setStatus("No Token ❌ — Please login again"); return; }
    if (!template) { setStatus("No template captured ❌ — Capture first"); return; }
    try {
      const res  = await fetch(`${BASE_URL}/fingerprint/get`, { method: "GET", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || !data.success) { setStatus(data.message || "No fingerprint found ❌"); return; }
      const storedTemplate = data.template;
      if (!storedTemplate) { setStatus("Stored template empty ❌"); return; }
      const match = window.VerifyFinger(template, storedTemplate, 0);
      if (match?.httpStaus && match.data?.Status) {
        setResult("✔ MATCH SUCCESS"); setStatus("✔ MATCH SUCCESS");
        try {
          if (window.StopCaptured) window.StopCaptured();
          if (window.UninitDevice) window.UninitDevice();
        } catch (e) { console.log("Cleanup error:", e.message); }
        setOpen(true);
      } else {
        setResult("❌ NOT MATCHED"); setStatus("❌ NOT MATCHED — Try again");
      }
    } catch (err) { setStatus("Error: " + err.message); }
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
            {/* Logo circle */}
            <div style={{
              width: 50, height: 50, borderRadius: 13,
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <MdFingerprint size={28} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f9fafb", letterSpacing: "-0.4px" }}>
                Fingerprint Verification
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
                  {/* Step node */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: done   ? "#16a34a"
                                : active ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                                : "#1f2937",
                      border: `2px solid ${done ? "#16a34a" : active ? "#6366f1" : "#374151"}`,
                      boxShadow: active ? "0 0 0 4px rgba(99,102,241,.2)" : "none",
                      transition: "all .3s",
                    }}>
                      {done
                        ? <FiCheckCircle size={18} color="#fff" />
                        : <span style={{ color: active ? "#fff" : "#4b5563" }}>{step.icon}</span>
                      }
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: ".3px",
                      color: done ? "#4ade80" : active ? "#a5b4fc" : "#4b5563",
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, margin: "0 6px", marginBottom: 22,
                      borderRadius: 2,
                      background: done
                        ? "linear-gradient(90deg,#16a34a,#4f46e5)"
                        : "#1f2937",
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

            <button onClick={getDevices} style={actionBtn("linear-gradient(135deg,#4f46e5,#6366f1)")}>
              <MdDeviceHub size={16} /> Scan Devices
            </button>

            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              style={{
                background: "#1f2937", border: "1px solid #374151",
                borderRadius: 9, padding: "9px 14px",
                fontSize: 13, color: "#d1d5db", outline: "none",
                cursor: "pointer", minWidth: 160,
              }}
            >
              {devices.length === 0 && <option value="">— No Devices —</option>}
              {devices.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>

            <button onClick={initDevice} style={actionBtn("linear-gradient(135deg,#0284c7,#0ea5e9)")}>
              <FiZap size={15} /> Initialize
            </button>

            <button onClick={capture} style={actionBtn("linear-gradient(135deg,#b45309,#d97706)")}>
              <FiCamera size={15} /> Capture
            </button>

            <button onClick={getTemplate} style={ghostBtn}>
              <FiFileText size={15} /> Get Template
            </button>

            <button onClick={save} style={actionBtn("linear-gradient(135deg,#15803d,#16a34a)")}>
              <FiSave size={15} /> Save
            </button>

            <button onClick={verify} style={actionBtn(
              "linear-gradient(135deg,#7c3aed,#9333ea)",
              "0 0 20px rgba(139,92,246,.35)"
            )}>
              <FiShield size={15} /> Verify
            </button>

          </div>
        </div>

        {/* ════ PREVIEW + TEMPLATE ════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Scan Preview */}
          <div style={{ ...card }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <BsEye size={15} color="#6366f1" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: ".8px", textTransform: "uppercase" }}>
                Scan Preview
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
                ? <img src={image} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="fingerprint" />
                : (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <MdFingerprint size={52} color="#1f2937" />
                    <span style={{ fontSize: 12, color: "#374151" }}>No scan yet</span>
                  </div>
                )
              }
            </div>
          </div>

          {/* Template Data */}
          <div style={{ ...card }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FiFileText size={15} color="#6366f1" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: ".8px", textTransform: "uppercase" }}>
                Template Data
              </span>
              {template && (
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
              value={template}
              readOnly
              placeholder="Template will appear here after step 4..."
              style={{
                width: "100%", height: 240, boxSizing: "border-box",
                background: "#0d1117",
                border: "1px solid #1f2937",
                borderRadius: 10, padding: "12px 14px",
                fontSize: 11, color: "#6b7280",
                fontFamily: "'Fira Code', 'Courier New', monospace",
                resize: "none", outline: "none", lineHeight: 1.7,
              }}
            />
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
                Fingerprint Verified
              </DialogTitle>
            </div>
            <DialogDescription style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.7 }}>
              {result} — Fingerprint matched successfully. Proceeding to Iris scan for second-factor verification.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ marginTop: 12 }}>
            <button
              style={{
                ...actionBtn("linear-gradient(135deg,#7c3aed,#9333ea)", "0 0 20px rgba(139,92,246,.4)"),
                padding: "10px 22px", fontSize: 14,
              }}
              onClick={() => {
                setOpen(false);
                setTemplate(""); setImage(""); setStatus("Done");
                router.push(`/user/${userid}/iris`);
              }}
            >
              <BsEye size={16} />
              Continue to Iris Scan
              <FiArrowRight size={15} />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}