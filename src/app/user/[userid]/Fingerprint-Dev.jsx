"use client";

import { useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

const BASE_URL = "https://e-voting-backend-u9dk.onrender.com";

export default function FingerprintDev() {

     const searchParams = useSearchParams();

  const userid = searchParams.get("userid");

  const [status, setStatus] = useState("Loading...");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");

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
        setStatus("SDK Ready ✔");
      } catch {
        setStatus("SDK Load Failed ❌");
      }
    };

    init();
  }, []);

  // GET DEVICE
  const getDevices = () => {
    try {
      const res = window.GetConnectedDeviceList();

      if (!res?.httpStaus || res.data.ErrorCode != 0) {
        setStatus("Device Error ❌");
        return;
      }

      const raw = res.data.ErrorDescription;
      const list = raw.split(":")[1].split(",").map(d => d.trim());

      setDevices(list);
      setSelectedDevice(list[0]);
      setStatus("Device Loaded ✔");
    } catch {
      setStatus("SDK Not Ready ❌");
    }
  };

  // INIT DEVICE
  const initDevice = () => {
    const res = window.InitDevice(selectedDevice, "");

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Init Failed ❌");
      return;
    }

    setStatus("Device Ready ✔");
  };

  // CAPTURE
  const capture = () => {
    const res = window.CaptureFinger(60, 10);

    if (!res?.httpStaus || res.data.ErrorCode != 0) {
      setStatus("Capture Failed ❌");
      return;
    }

    setImage("data:image/bmp;base64," + res.data.BitmapData);
    setStatus("Captured ✔");
  };

  // GET TEMPLATE
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

  // SAVE
  const save = async () => {
    const token = getToken();

    const res = await fetch(`${BASE_URL}/users/add-finger`, {
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

  // VERIFY (FIXED - FINAL)
const verify = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setStatus("No Token ❌");
    return;
  }

  try {
    // 1. GET STORED TEMPLATE FROM BACKEND
    const res = await fetch(`${BASE_URL}/users/get-finger`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

    // 2. USE ALREADY CAPTURED TEMPLATE (FROM SAVE / CURRENT STATE)
    if (!template) {
      setStatus("No current template to compare ❌");
      return;
    }

    // 3. COMPARE USING SDK
    const match = window.VerifyFinger(template, storedTemplate, 0);

    if (match?.httpStaus && match.data?.Status) {
      setStatus("✔ MATCH SUCCESS");
    } else {
      setStatus("❌ NOT MATCHED");
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
          <CardTitle className="text-base">
            Fingerprint System
          </CardTitle>
          <Badge variant="outline">{status}</Badge>
        </CardHeader>
      </Card>

      {/* CONTROLS */}
      <Card>
        <CardContent className="flex flex-wrap gap-2 p-2 items-center">

          <Button size="sm" onClick={getDevices}>
            Devices
          </Button>

          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            {devices.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </select>

          <Button size="sm" onClick={initDevice}>
            Init
          </Button>

          <Button size="sm" onClick={capture}>
            Capture
          </Button>

          <Button size="sm" variant="outline" onClick={getTemplate}>
            Temp
          </Button>

          <Button size="sm" className="bg-green-600" onClick={save}>
            Save
          </Button>

          <Button size="sm" className="bg-blue-600" onClick={verify}>
            Verify
          </Button>

        </CardContent>
      </Card>

      {/* BODY */}
      <div className="grid grid-cols-2 gap-2 h-[300px]">

        {/* IMAGE */}
        <Card>
          <CardHeader className="py-1">
            <CardTitle className="text-sm">Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] bg-gray-200 rounded flex items-center justify-center overflow-hidden">
              {image ? (
                <img
                  src={image}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">
                  No Scan
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TEMPLATE */}
        <Card>
          <CardHeader className="py-1">
            <CardTitle className="text-sm">Template</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={template}
              readOnly
              className="w-full h-[220px] text-xs border rounded p-2"
            />
          </CardContent>
        </Card>

      </div>
    </div>
  </div>
);
}