"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

// ✅ FIXED: Use same render backend URL (not localhost)
const BASE_URL = "http://localhost:5000"; // Change to your backend URL

export default function IrisDashboard({ userid }) {
  const router = useRouter();
  const sdkLoaded = useRef(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("Loading...");
  const [scanner, setScanner] = useState(null);
  const [image, setImage] = useState("");
  const [irisData, setIrisData] = useState("");
  const [quality, setQuality] = useState(null);

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

    (async () => {
      try {
        await load("https://code.jquery.com/jquery-3.6.0.min.js");
        await load("/marvisauth.js");
        setStatus("SDK Ready ✔ — Click 'Get Device'");
      } catch {
        setStatus("SDK Load Failed ❌");
      }
    })();
  }, []);

  // GET DEVICE
  const getDevice = () => {
    try {
      const res = window.GetMarvisAuthInfo();

      if (res?.data?.ErrorCode !== "0") {
        setStatus("Device Not Found ❌ — Check USB");
        return;
      }

      setScanner(res.data.DeviceInfo1?.Model || "Connected");
      setStatus("Device Connected ✔ — Click 'Capture'");
    } catch {
      setStatus("SDK Not Ready ❌");
    }
  };

  // CAPTURE
  const capture = () => {
    setImage("");
    setIrisData("");
    setQuality(null);

    const res = window.CaptureIris(15, 50);

    if (!res?.data || res.data.ErrorCode !== "0") {
      setStatus("Capture Failed ❌ — Try again");
      return;
    }

    const bmp = res.data.BitmapData;
    setImage("data:image/bmp;base64," + bmp);
    setIrisData(bmp);
    setQuality(parseInt(res.data.Quality));
    setStatus("Captured ✔ — Click 'Enroll' or 'Verify'");
  };

  // ENROLL
  const enroll = async () => {
    if (!irisData) {
      setStatus("No iris data ❌ — Capture first");
      return;
    }

    const token = getToken();

    const res = await fetch(`${BASE_URL}/iris/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ irisImageBase64: irisData }),
    });

    const data = await res.json();
    setStatus(data.success ? "Enrolled ✔" : `Enroll Failed ❌ — ${data.message || ""}`);
  };

  // VERIFY
  const verify = async () => {
    if (!irisData) {
      setStatus("No iris data ❌ — Capture first");
      return;
    }

    const token = getToken();

    if (!token) {
      setStatus("No token ❌ — Please login again");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/iris/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ irisImageBase64: irisData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`Auth Failed ❌ (${res.status}) — Token may be expired`);
        return;
      }

      if (data.verified) {
        setResult("✔ MATCH SUCCESS");
        setStatus("✔ MATCH SUCCESS");

        // ✅ Save iris verification state
        localStorage.setItem("irisVerified", "true");

        // ✅ Cleanup iris SDK device
        try {
          if (window.StopCapture) window.StopCapture();
          if (window.StopDevice) window.StopDevice();
          if (window.ReleaseDevice) window.ReleaseDevice();
          if (window.DisconnectDevice) window.DisconnectDevice();
          if (window.CloseDevice) window.CloseDevice();

          setScanner(null);
          setImage("");
          setIrisData("");
          setQuality(null);
        } catch (e) {
          console.log("Device cleanup:", e.message);
        }

        setOpen(true);
      } else {
        setResult("❌ NOT MATCHED");
        setStatus("❌ NOT MATCHED — Try again");
      }
    } catch (err) {
      setStatus("Network Error: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center p-2">
      <div className="w-full max-w-3xl space-y-2">

        {/* HEADER */}
        <Card>
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Iris Verification</CardTitle>
              <Badge variant="outline">{status}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* STEP GUIDE */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 text-xs text-purple-700">
            <strong>Steps:</strong> 1. Get Device → 2. Capture → 3. Enroll (first time) / Verify
          </CardContent>
        </Card>

        {/* CONTROLS */}
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-2 items-center">
            <Button size="sm" onClick={getDevice}>
              1. Get Device
            </Button>

            <span className="text-sm text-gray-500">
              {scanner ? `✔ ${scanner}` : "No Device"}
            </span>

            <Button size="sm" onClick={capture}>
              2. Capture
            </Button>

            <Button size="sm" className="bg-green-600" onClick={enroll}>
              3. Enroll
            </Button>

            <Button size="sm" className="bg-blue-600" onClick={verify}>
              4. Verify
            </Button>
          </CardContent>
        </Card>

        {/* BODY */}
        <div className="grid grid-cols-2 gap-2 h-[300px]">
          {/* IMAGE */}
          <Card>
            <CardHeader className="py-1">
              <CardTitle className="text-sm">Iris Scan</CardTitle>
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

          {/* DATA */}
          <Card>
            <CardHeader className="py-1">
              <CardTitle className="text-sm">Iris Data</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={irisData}
                readOnly
                className="w-full h-[220px] text-xs border rounded p-2"
                placeholder="Iris data will appear here after capture..."
              />
              {quality !== null && (
                <p className="text-xs mt-1 text-green-600 font-medium">
                  Quality: {quality}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SUCCESS DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iris Verified ✔</DialogTitle>
            <DialogDescription>
              {result} — Identity confirmed! You can now proceed to vote.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="sm"
              className="bg-purple-600"
              onClick={() => {
                setOpen(false);
                router.push(`/user/${userid}/success`);
              }}
            >
              Proceed to Vote →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}