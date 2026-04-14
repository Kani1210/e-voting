"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ ADD

import { getFinger, saveFinger } from "@/services/fingerprintService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function FingerDashboard({ userid }) { // ✅ RECEIVE USERID

  const [status, setStatus] = useState("Loading...");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [template, setTemplate] = useState("");
  const [image, setImage] = useState("");

  const sdkLoaded = useRef(false);
  const router = useRouter(); // ✅ ADD ROUTER

  useEffect(() => {
    if (sdkLoaded.current) return;
    sdkLoaded.current = true;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();

        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
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

  const getDevices = () => {
    try {
      const res = window.GetConnectedDeviceList();

      if (!res?.httpStaus || res.data.ErrorCode !== 0) {
        setStatus("Device Error ❌");
        return;
      }

      const raw = res.data.ErrorDescription;
      const list = raw.split(":")[1].split(",").map((d) => d.trim());

      setDevices(list);
      setSelectedDevice(list[0] || "");
      setStatus("Device Loaded ✔");
    } catch {
      setStatus("SDK Not Ready ❌");
    }
  };

  const initDevice = () => {
    const res = window.InitDevice(selectedDevice, "");

    if (!res?.httpStaus || res.data.ErrorCode !== 0) {
      setStatus("Init Failed ❌");
      return;
    }

    setStatus("Ready ✔");
  };

  const capture = () => {
    const res = window.CaptureFinger(60, 10);

    if (!res?.httpStaus || res.data.ErrorCode !== 0) {
      setStatus("Capture Failed ❌");
      return;
    }

    setImage("data:image/bmp;base64," + res.data.BitmapData);
    setStatus("Captured ✔");
  };

  const getTemplate = () => {
    const res = window.GetTemplate(0);

    if (!res?.httpStaus || res.data.ErrorCode !== 0) {
      setStatus("Template Error ❌");
      return;
    }

    const tpl =
      res.data.TemplateData ||
      res.data.FMRData ||
      res.data.ImgData;

    setTemplate((tpl || "").trim());
    setStatus("Template Ready ✔");
  };

  const save = async () => {
    const data = await saveFinger(template);
    setStatus(data.success ? "Saved ✔" : "Save Failed ❌");
  };

  // ===================== VERIFY (UPDATED) =====================
  const verify = async () => {
    const res = await getFinger();

    if (!res.success) {
      setStatus("No Fingerprint ❌");
      router.push("/finger/verify-user");
      return;
    }

    const match = window.VerifyFinger(template, res.template, 0);

    const isMatch = match?.httpStaus && match.data?.Status;

    setStatus(isMatch ? "MATCH ✔" : "NO MATCH ❌");

    // 🚀 NAVIGATE ON MATCH
    if (isMatch) {
      router.push("/finger/verify-user");
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
            <Button size="sm" onClick={getDevices}>Devices</Button>

            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((d, i) => (
                  <SelectItem key={i} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" onClick={initDevice}>Init</Button>
            <Button size="sm" onClick={capture}>Capture</Button>
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

          <Card>
            <CardHeader className="py-1">
              <CardTitle className="text-sm">Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                {image ? (
                  <img src={image} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-sm">No Scan</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-1">
              <CardTitle className="text-sm">Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={template}
                readOnly
                className="h-[220px] text-xs"
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}