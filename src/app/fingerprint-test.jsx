"use client";

import { useEffect, useRef, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function FingerprintApp() {
  const [status, setStatus] = useState("Loading...");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  const [template, setTemplate] = useState("");
  const [image, setImage] = useState("");

  const [quality, setQuality] = useState(60);
  const [timeout, setTimeoutVal] = useState(10);
  const [templateType, setTemplateType] = useState(0);

  const sdkLoaded = useRef(false);

  const getToken = () => localStorage.getItem("token");

  /* =========================
     LOAD SDK
  ========================= */
  useEffect(() => {
    if (sdkLoaded.current) return;
    sdkLoaded.current = true;

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
        setStatus("SDK Ready ✔");
      } catch {
        setStatus("SDK Load Failed ❌");
      }
    };

    init();
  }, []);

  /* =========================
     GET DEVICES (FIXED)
  ========================= */
  const getDevices = () => {
    try {
      const res = window.GetConnectedDeviceList();

      if (!res?.httpStaus) {
        setStatus("Device API Error ❌");
        return;
      }

      // ✅ FIX: supports "0" and 0
      if (res.data.ErrorCode == 0) {
        const raw = res.data.ErrorDescription;

        if (!raw || !raw.includes(":")) {
          setStatus("No device found ❌");
          return;
        }

        const list = raw
          .split(":")[1]
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d.length > 0);

        if (list.length === 0) {
          setStatus("No device found ❌");
          return;
        }

        setDevices(list);
        setSelectedDevice(list[0]);
        setStatus("Device Loaded ✔");
      } else {
        setStatus(res.data.ErrorDescription || "Device Not Found ❌");
      }
    } catch (e) {
      setStatus("SDK not loaded ❌");
    }
  };

  /* =========================
     INIT DEVICE (FIXED)
  ========================= */
  const initDevice = () => {
    if (!selectedDevice) {
      setStatus("Select device ❌");
      return;
    }

    const check = window.IsDeviceConnected(selectedDevice);

    // ✅ FIX: supports both "0" and 0
    if (!check?.httpStaus || check.data.ErrorCode != 0) {
      setStatus("Device not connected ❌");
      return;
    }

    const res = window.InitDevice(selectedDevice, "");

    if (!res?.httpStaus) {
      setStatus("Init API Error ❌");
      return;
    }

    if (res.data.ErrorCode == 0) {
      setStatus("Device Ready ✔");
    } else {
      setStatus(`Init Failed ❌ (${res.data.ErrorDescription})`);
    }
  };

  /* =========================
     CAPTURE
  ========================= */
  const capture = () => {
    const res = window.CaptureFinger(quality, timeout);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Capture Failed ❌");
      return;
    }

    setImage("data:image/bmp;base64," + res.data.BitmapData);
    setStatus("Captured ✔");
  };

  /* =========================
     GET TEMPLATE
  ========================= */
  const getTemplate = () => {
    const res = window.GetTemplate(templateType);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Template Error ❌");
      return;
    }

    let tpl =
      res.data.TemplateData ||
      res.data.FMRData ||
      res.data.ImgData;

    tpl = tpl.trim().replace(/\s/g, "");

    setTemplate(tpl);
    setStatus("Template Ready ✔");
  };

  /* =========================
     SAVE
  ========================= */
  const saveFinger = async () => {
    const token = getToken();

    if (!template) {
      setStatus("No template ❌");
      return;
    }

    const res = await fetch(`${BASE_URL}/users/add-finger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ template }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus("Saved to DB ✔");
    } else {
      setStatus("Save failed ❌");
    }
  };

  /* =========================
     VERIFY
  ========================= */
  const verify = async () => {
    const token = getToken();

    const res = await fetch(`${BASE_URL}/users/get-finger`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.success) {
      setStatus("No stored template ❌");
      return;
    }

    let storedTemplate = data.template.trim().replace(/\s/g, "");

    const newRes = window.GetTemplate(templateType);

    if (!newRes?.httpStaus || newRes.data.ErrorCode != 0) {
      setStatus("New capture failed ❌");
      return;
    }

    let newTemplate =
      newRes.data.TemplateData ||
      newRes.data.FMRData ||
      newRes.data.ImgData;

    newTemplate = newTemplate.trim().replace(/\s/g, "");

    const matchRes = window.VerifyFinger(
      newTemplate,
      storedTemplate,
      templateType
    );

    if (matchRes?.httpStaus) {
      if (matchRes.data.Status) {
        setStatus("✔ MATCH SUCCESS");
      } else {
        setStatus("❌ NOT MATCHED");
      }
    } else {
      setStatus("Verify Error ❌");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Fingerprint System</h2>

      <p>Status: {status}</p>

      {/* DEVICE */}
      <button onClick={getDevices}>Get Devices</button>

      <select
        value={selectedDevice}
        onChange={(e) => setSelectedDevice(e.target.value)}
      >
        {devices.map((d, i) => (
          <option key={i}>{d}</option>
        ))}
      </select>

      <button onClick={initDevice}>Init</button>

      {/* ACTIONS */}
      <div style={{ marginTop: 10 }}>
        <button onClick={capture}>Capture</button>
        <button onClick={getTemplate}>Get Template</button>
        <button onClick={saveFinger}>Save</button>
        <button onClick={verify}>Verify</button>
      </div>

      {/* IMAGE */}
      {image && <img src={image} width={120} />}

      {/* TEMPLATE */}
      <textarea
        value={template}
        readOnly
        rows={4}
        style={{ width: "100%", marginTop: 10 }}
      />

      {/* SETTINGS */}
      <div style={{ marginTop: 10 }}>
        <label>Quality:</label>
        <input
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
        />

        <label>Timeout:</label>
        <input
          value={timeout}
          onChange={(e) => setTimeoutVal(e.target.value)}
        />

        <label>Template Type:</label>
        <select
          onChange={(e) => setTemplateType(Number(e.target.value))}
        >
          <option value={0}>FMR V2005</option>
          <option value={1}>FMR V2011</option>
          <option value={2}>ANSI</option>
        </select>
      </div>
    </div>
  );
}