"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "http://localhost:5000";

export default function IrisDashboard({ userid }) {
  const sdkLoaded = useRef(false);

  const [status, setStatus] = useState("Loading SDK...");
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [irisBase64, setIrisBase64] = useState("");
  const [irisImage, setIrisImage] = useState("");
  const [quality, setQuality] = useState("");

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

    (async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
        await loadScript("/marvisauth.js");
        setStatus("SDK Loaded ✔");
      } catch {
        setStatus("SDK Load Failed ❌");
      }
    })();
  }, []);

  const getInfo = () => {
    const res = window.GetMarvisAuthInfo();

    if (res?.data?.ErrorCode === "0") {
      setDeviceInfo(res.data.DeviceInfo1);
      setStatus("Device Connected ✔");
    } else {
      setStatus("Device Not Connected ❌");
    }
  };

  const captureIris = () => {
    const res = window.CaptureIris(15, 55);

    if (!res?.data || res.data.ErrorCode !== "0") {
      setStatus("Capture Failed ❌");
      return;
    }

    const bmpBase64 = res.data.BitmapData;

    setIrisBase64(bmpBase64);
    setIrisImage("data:image/bmp;base64," + bmpBase64);
    setQuality(res.data.Quality);

    setStatus("Capture Success ✔");
  };

  const enrollIris = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/iris/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ irisImage: irisBase64 }),
    });

    const data = await res.json();
    setStatus(data.success ? "Enrolled ✔" : "Enroll Failed ❌");
  };

  const verifyIris = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/iris/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ irisImage: irisBase64 }),
    });

    const data = await res.json();

    setStatus(
      data.verified
        ? `✔ Verified (distance: ${data.distance})`
        : `❌ Not Matched (distance: ${data.distance})`
    );
  };

  return (
    <div className="mt-12 flex justify-center items-center p-2">
      <div className="w-full max-w-3xl space-y-2">

        {/* HEADER */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-base">
              Iris System - User {userid}
            </CardTitle>
            <Badge variant="outline">{status}</Badge>
          </CardHeader>
        </Card>

        {/* CONTROLS */}
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-2 items-center">

            <Button size="sm" onClick={getInfo}>
              Device Info
            </Button>

            <Button size="sm" onClick={captureIris}>
              Capture
            </Button>

            <Button size="sm" className="bg-green-600" onClick={enrollIris}>
              Enroll
            </Button>

            <Button size="sm" className="bg-blue-600" onClick={verifyIris}>
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
                {irisImage ? (
                  <img
                    src={irisImage}
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

          {/* DATA */}
          <Card>
            <CardHeader className="py-1">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={irisBase64}
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