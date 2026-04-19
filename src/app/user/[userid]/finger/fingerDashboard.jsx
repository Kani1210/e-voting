"use client";

import { useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:5000"; // Change to your backend URL

export default function FingerprintDashboard({ userid }) {
  const [status, setStatus] = useState("Loading...");
  const router = useRouter();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [template, setTemplate] = useState("");
  const [image, setImage] = useState("");

  const sdkLoaded = useRef(false);

  const getToken = () => localStorage.getItem("token");

  // LOAD SDK
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

        // ✅ Always uninit first to clear any stale device state
        try {
          if (window.UninitDevice) window.UninitDevice();
        } catch (e) {
          console.log("Uninit on load:", e.message);
        }

        setStatus("SDK Ready ✔ — Click 'Devices' to start");
      } catch {
        setStatus("SDK Load Failed ❌");
      }
    };

    init();
  }, []);

  // GET DEVICES
  const getDevices = () => {
    try {
      const res = window.GetConnectedDeviceList();

      if (!res?.httpStaus || res.data.ErrorCode != 0) {
        setStatus("Device Error ❌ — Check USB connection");
        return;
      }

      const raw = res.data.ErrorDescription;
      const list = raw.split(":")[1].split(",").map((d) => d.trim());

      setDevices(list);
      setSelectedDevice(list[0]);
      setStatus("Devices Found ✔ — Click 'Init' next");
    } catch {
      setStatus("SDK Not Ready ❌");
    }
  };

  // INIT DEVICE
  const initDevice = () => {
    if (!selectedDevice) {
      setStatus("No device selected ❌");
      return;
    }

    const res = window.InitDevice(selectedDevice, "");

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Init Failed ❌");
      return;
    }

    setStatus("Device Ready ✔ — Click 'Capture' now");
  };

  // CAPTURE
  const capture = () => {
    setImage("");
    setTemplate("");
    const res = window.CaptureFinger(60, 10);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Capture Failed ❌ — Try again");
      return;
    }

    setImage("data:image/bmp;base64," + res.data.BitmapData);
    setStatus("Captured ✔ — Click 'Get Template' next");
  };

  // GET TEMPLATE
  const getTemplate = () => {
    const res = window.GetTemplate(0);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Template Error ❌");
      return;
    }

    const tpl =
      res.data.TemplateData || res.data.FMRData || res.data.ImgData;

    setTemplate(tpl.trim());
    setStatus("Template Ready ✔ — Click 'Save' or 'Verify'");
  };

  // SAVE
  const save = async () => {
    if (!template) {
      setStatus("No template to save ❌");
      return;
    }

    const token = getToken();
    const res = await fetch(`${BASE_URL}/fingerprint/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ template }),
    });

    const data = await res.json();
    setStatus(data.success ? "Saved ✔" : "Save Failed ❌");
  };

  // VERIFY
  const verify = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("No Token ❌ — Please login again");
      return;
    }

    if (!template) {
      setStatus("No template captured ❌ — Capture first");
      return;
    }

    try {
      // 1. GET STORED TEMPLATE FROM BACKEND
      const res = await fetch(`${BASE_URL}/fingerprint/get`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus(data.message || "No fingerprint found ❌");
        return;
      }

      const storedTemplate = data.template;

      if (!storedTemplate) {
        setStatus("Stored template empty ❌");
        return;
      }

      // 2. COMPARE USING SDK
      const match = window.VerifyFinger(template, storedTemplate, 0);

      if (match?.httpStaus && match.data?.Status) {
        setResult("✔ MATCH SUCCESS");
        setStatus("✔ MATCH SUCCESS");

        // ✅ UNINIT DEVICE BEFORE NAVIGATING (fixes "Device Uninitialized" on iris)
        try {
          if (window.StopCaptured) window.StopCaptured();
          if (window.UninitDevice) window.UninitDevice();
        } catch (e) {
          console.log("Cleanup error:", e.message);
        }

        setOpen(true);
      } else {
        setResult("❌ NOT MATCHED");
        setStatus("❌ NOT MATCHED — Try again");
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center p-2">
      <div className="w-full max-w-3xl space-y-2">

        {/* HEADER */}
        <Card>
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Fingerprint Verification</CardTitle>
              <Badge variant="outline">{status}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* STEP GUIDE */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-xs text-blue-700">
            <strong>Steps:</strong> 1. Devices → 2. Select Device → 3. Init → 4. Capture → 5. Get Template → 6. Verify
          </CardContent>
        </Card>

        {/* CONTROLS */}
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-2 items-center">
            <Button size="sm" onClick={getDevices}>
              1. Devices
            </Button>

            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              {devices.length === 0 && (
                <option value="">-- No Devices --</option>
              )}
              {devices.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>

            <Button size="sm" onClick={initDevice}>
              2. Init
            </Button>

            <Button size="sm" onClick={capture}>
              3. Capture
            </Button>

            <Button size="sm" variant="outline" onClick={getTemplate}>
              4. Get Template
            </Button>

            <Button size="sm" className="bg-green-600" onClick={save}>
              Save
            </Button>

            <Button size="sm" className="bg-blue-600" onClick={verify}>
              5. Verify
            </Button>
          </CardContent>
        </Card>

        {/* BODY */}
        <div className="grid grid-cols-2 gap-2 h-[300px]">
          {/* IMAGE */}
          <Card>
            <CardHeader className="py-1">
              <CardTitle className="text-sm">Scan Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                {image ? (
                  <img src={image} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-sm">No Scan Yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TEMPLATE */}
          <Card>
            <CardHeader className="py-1">
              <CardTitle className="text-sm">Template Data</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={template}
                readOnly
                className="w-full h-[220px] text-xs border rounded p-2"
                placeholder="Template will appear here after step 4..."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SUCCESS DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fingerprint Verified ✔</DialogTitle>
            <DialogDescription>
              {result} — Fingerprint matched successfully! Proceeding to Iris scan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="sm"
              className="bg-purple-600"
              onClick={() => {
                setOpen(false);
                setTemplate("");
                setImage("");
                setStatus("Done");
                // ✅ Navigate to iris page
                router.push(`/user/${userid}/iris`);
              }}
            >
              Continue to Iris →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}