"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
const BASE_URL = "http://localhost:5000";


export default function IrisSystemVerify() {
  const sdkLoaded = useRef(false);
  const router = useRouter();

  const [status, setStatus] = useState("Loading SDK...");
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [irisBase64, setIrisBase64] = useState("");
  const [irisImage, setIrisImage] = useState("");
  const [quality, setQuality] = useState("");

  /* ---------------- LOAD SDK ---------------- */
  useEffect(() => {
    if (sdkLoaded.current) return;
    sdkLoaded.current = true;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();

        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(`Failed to load ${src}`);
        document.body.appendChild(script);
      });

    (async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
        await loadScript("/marvisauth.js");

        if (!window.GetMarvisAuthInfo || !window.CaptureIris) {
          setStatus("SDK Functions Missing ❌");
          return;
        }

        setStatus("SDK Loaded ✅");
      } catch (err) {
        console.error(err);
        setStatus("SDK Load Failed ❌");
      }
    })();
  }, []);

  /* ---------------- GET DEVICE INFO ---------------- */
  const getInfo = () => {
    try {
      if (!window.GetMarvisAuthInfo) {
        setStatus("SDK Not Available ❌");
        return;
      }

      const res = window.GetMarvisAuthInfo();
      console.log("DEVICE RESPONSE:", res);

      if (res?.data?.ErrorCode === "0") {
        setDeviceInfo(res.data.DeviceInfo1);
        setStatus("Device Connected ✅");
      } else {
        setStatus("Device Not Connected ❌");
      }
    } catch (err) {
      console.error(err);
      setStatus("SDK Error ❌");
    }
  };

  /* ---------------- CAPTURE IRIS ---------------- */
  const captureIris = () => {
    try {
      if (!window.CaptureIris) {
        setStatus("Capture Function Missing ❌");
        return;
      }

      setStatus("Capturing iris...");

      const res = window.CaptureIris(15, 55);
      console.log("CAPTURE RESPONSE:", res);

      if (!res?.data || res.data.ErrorCode !== "0") {
        setStatus("Capture Failed ❌");
        return;
      }

      const bmpBase64 = res.data.BitmapData;

      if (!bmpBase64) {
        setStatus("No Image Data ❌");
        return;
      }

      setIrisBase64(bmpBase64); // ✅ RAW BASE64
      setIrisImage("data:image/bmp;base64," + bmpBase64); // ✅ only for UI
      setQuality(res.data.Quality);

      setStatus("Capture Success ✅");

      window.UnInit?.();
    } catch (err) {
      console.error(err);
      setStatus("Capture Error ❌");
    }
  };

  /* ---------------- ENROLL ---------------- */
  const enrollIris = async () => {
    const token = localStorage.getItem("token");

    if (!token) return setStatus("Login Required ❌");
    if (!irisBase64) return setStatus("No iris image ❌");

    try {
      setStatus("Enrolling...");

      const res = await fetch(`${BASE_URL}/iris/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          irisImage: irisBase64, // ✅ FIXED (NO PREFIX)
        }),
      });

      const data = await res.json();
      console.log("ENROLL RESPONSE:", data);

      if (data.success) {
        setStatus("Iris Enrolled ✅");
      } else {
        setStatus(data.message || data.error || "Enroll Failed ❌");
      }
    } catch (err) {
      console.error(err);
      setStatus("Enroll Server Error ❌");
    }
  };

  /* ---------------- VERIFY ---------------- */
  const verifyIris = async () => {
    const token = localStorage.getItem("token");

    if (!token) return setStatus("Login Required ❌");
    if (!irisBase64) return setStatus("No iris image ❌");

    try {
      setStatus("Verifying...");

      const res = await fetch(`${BASE_URL}/iris/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          irisImage: irisBase64, // ✅ FIXED (NO PREFIX)
        }),
      });

      const data = await res.json();
      console.log("VERIFY RESPONSE:", data);

      if (data.verified) {
        setStatus(`✅ Verified (distance: ${data.distance})`);
        setTimeout(() => {
          router.push("/verifypage"); // Redirect to voting page after successful verification  
        },1000);
      } else {
        setStatus(`❌ Not Matched (distance: ${data.distance})`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Verify Server Error ❌");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: 20 }}>
      <h2>👁 Iris System</h2>

      <p><b>Status:</b> {status}</p>

      {deviceInfo && (
        <div style={{ background: "#eee", padding: 10 }}>
          <p>Serial: {deviceInfo.SerialNo}</p>
          <p>Model: {deviceInfo.Model}</p>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={getInfo}>Get Info</button>
        <button onClick={captureIris}>Capture</button>
        <button onClick={enrollIris}>Enroll</button>
        <button onClick={verifyIris}>Verify</button>
      </div>

      {quality && <p>Quality: {quality}</p>}

      {irisImage && (
        <img
          src={irisImage}
          width={200}
          alt="iris"
          style={{ border: "1px solid #ccc", marginTop: 10 }}
        />
      )}

      <textarea
        value={irisBase64}
        readOnly
        style={{ width: "100%", height: 120, marginTop: 10 }}
      />
    </div>
  );
}