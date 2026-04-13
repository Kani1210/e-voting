"use client";

import { useEffect, useRef, useState } from "react";
import { getFinger, saveFinger } from "@/services/fingerprintService";



export default function FingerprintApp() {
  const [status, setStatus] = useState("Loading...");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  const [template, setTemplate] = useState("");
  const [image, setImage] = useState("");

  const sdkLoaded = useRef(false);

  // LOAD SDK (UNCHANGED)
  useEffect(() => {
    if (sdkLoaded.current) return;
    sdkLoaded.current = true;

    const load = (src) =>
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
        await load("https://code.jquery.com/jquery-3.6.0.min.js");
        await load("/morfinauth.js");
        setStatus("SDK Ready ✔");
      } catch {
        setStatus("SDK Load Failed ❌");
      }
    };

    init();
  }, []);

  // GET DEVICE (UNCHANGED)
  const getDevices = () => {
    try {
      const res = window.GetConnectedDeviceList();

      if (!res?.httpStaus || res.data.ErrorCode != 0) {
        setStatus("Device Error ❌");
        return;
      }

      const raw = res.data.ErrorDescription;
      const list = raw.split(":")[1].split(",").map((d) => d.trim());

      setDevices(list);
      setSelectedDevice(list[0]);
      setStatus("Device Loaded ✔");
    } catch {
      setStatus("SDK Not Ready ❌");
    }
  };

  // INIT (UNCHANGED)
  const initDevice = () => {
    const res = window.InitDevice(selectedDevice, "");

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Init Failed ❌");
      return;
    }

    setStatus("Device Ready ✔");
  };

  // CAPTURE (UNCHANGED)
  const capture = () => {
    const res = window.CaptureFinger(60, 10);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Capture Failed ❌");
      return;
    }

    setImage("data:image/bmp;base64," + res.data.BitmapData);
    setStatus("Captured ✔");
  };

  // TEMPLATE (UNCHANGED)
  const getTemplate = () => {
    const res = window.GetTemplate(0);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Template Error ❌");
      return;
    }

    const tpl =
      res.data.TemplateData ||
      res.data.FMRData ||
      res.data.ImgData;

    setTemplate(tpl.trim());
    setStatus("Template Ready ✔");
  };

  // SAVE (ONLY API MOVED)
  const save = async () => {
    const data = await saveFinger(template);

    setStatus(data.success ? "Saved ✔" : data.message || "Save Failed ❌");
  };

  // VERIFY (ONLY API MOVED)
  const verify = async () => {
    const res = await getFinger();

    if (!res.success) {
      setStatus(res.message || "No fingerprint found ❌");
      return;
    }

    const storedTemplate = res.template;

    if (!template) {
      setStatus("No current template ❌");
      return;
    }

    const match = window.VerifyFinger(template, storedTemplate, 0);

    if (match?.httpStaus && match.data?.Status) {
      setStatus("✔ MATCH SUCCESS");
    } else {
      setStatus("❌ NOT MATCHED");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Fingerprint System</h2>

      <p>Status: {status}</p>

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
      <button onClick={capture}>Capture</button>
      <button onClick={getTemplate}>Get Template</button>
      <button onClick={save}>Save</button>
      <button onClick={verify}>Verify</button>

      {image && <img src={image} width={120} />}

      <textarea
        value={template}
        readOnly
        style={{ width: "100%", marginTop: 10 }}
      />
    </div>
  );
}