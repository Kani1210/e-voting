"use client";

import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Loader2, Fingerprint } from "lucide-react";

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
        setStatus("SDK Load Failed ❌");
      }
    };

    init();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const getDevices = () => {
    const res = window.GetConnectedDeviceList();

    if (!res?.httpStaus) return setStatus("Device Error ❌");

    const device =
      res.data.ErrorDescription?.split(":")[1]?.split(",")[0];

    setSelectedDevice(device);
    setStatus("Device Selected ✔");
  };

  const initDevice = () => {
    const res = window.InitDevice(selectedDevice, "");
    if (!res?.httpStaus) return setStatus("Init Failed ❌");
    setStatus("Device Ready ✔");
  };

  const captureFinger = () => {
    const res = window.CaptureFinger(60, 10);

    if (!res?.httpStaus) return setStatus("Capture Failed ❌");

    setFingerImage("data:image/bmp;base64," + res.data.BitmapData);
    setStatus("Captured ✔");
  };

  const getTemplate = () => {
    const res = window.GetTemplate(templateType);

    if (!res?.httpStaus) return setStatus("Template Error ❌");

    const tpl =
      res.data.TemplateData ||
      res.data.FMRData ||
      res.data.ImgData;

    if (!tpl) return setStatus("Template Not Found ❌");

    setTemplate(tpl);
    setStatus("Template Ready ✔");
  };

  const saveToDB = async () => {
    if (!template) return setStatus("No Template ❌");

    const token = getToken();
    if (!token) return setStatus("Login required ❌");

    setBusy(true);
    setStatus("Saving...");

    try {
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
        setStatus("Saved ✔");
        setTemplate("");
        setFingerImage("");
      } else {
        setStatus("Save Failed ❌");
      }
    } catch (e) {
      setStatus("Error ❌");
    } finally {
      setBusy(false);
    }
  };

  const verifyFinger = async () => {
    if (!template) return setStatus("No Template ❌");

    const token = getToken();
    if (!token) return setStatus("Login required ❌");

    setStatus("Verifying...");

    try {
      const res = await fetch(`${BASE_URL}/users/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ finger: template }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✔ VERIFIED SUCCESS");
      } else {
        setStatus("❌ NOT MATCHED");
      }
    } catch {
      setStatus("Error ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4">
      
      <Card className="w-full max-w-xl rounded-2xl shadow-2xl">
        
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Fingerprint className="w-10 h-10 text-primary" />
          </div>

          <CardTitle>Fingerprint System</CardTitle>

          <p className="text-sm text-muted-foreground">
            SDK: {sdkReady ? "READY ✔" : "LOADING..."}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          
          <p className="text-center text-sm">{status}</p>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={getDevices}>Get Devices</Button>
            <Button onClick={initDevice}>Init Device</Button>
            <Button onClick={captureFinger}>Capture</Button>
            <Button onClick={getTemplate}>Get Template</Button>
          </div>

          {/* IMAGE */}
          {fingerImage && (
            <div className="flex justify-center">
              <img src={fingerImage} className="w-28 border rounded-lg" />
            </div>
          )}

          {/* SAVE */}
          <Button
            onClick={saveToDB}
            disabled={!template || busy}
            className="w-full"
          >
            {busy && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {busy ? "Saving..." : "Save to Backend"}
          </Button>

          {/* VERIFY */}
          <Button
            onClick={verifyFinger}
            disabled={!template}
            variant="secondary"
            className="w-full"
          >
            Verify Fingerprint
          </Button>

          {/* TEMPLATE PREVIEW */}
          <div className="text-xs break-all bg-muted p-3 rounded-lg">
            {template?.slice(0, 150)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}