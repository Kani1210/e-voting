"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function FingerprintTest() {
  const [output, setOutput] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("Checking...");
  const [loading, setLoading] = useState(false);

  const log = (data) => {
    setOutput(data);
  };

  /* 🟢 AUTO INIT + CHECK */
  const autoDetectDevice = async () => {
    try {
      setLoading(true);

      // Wait until SDK is available
      const waitForSDK = () =>
        new Promise((resolve) => {
          const interval = setInterval(() => {
            if (window.InitDevice && window.IsDeviceConnected) {
              clearInterval(interval);
              resolve(true);
            }
          }, 200);
        });

      await waitForSDK();

      // 1️⃣ INIT DEVICE
      const initRes = window.InitDevice("WEB_CLIENT", "12345");

      // 2️⃣ CHECK DEVICE
      const checkRes = window.IsDeviceConnected("WEB_CLIENT");

      const isConnected =
        checkRes === true ||
        checkRes === "true" ||
        checkRes === 1 ||
        checkRes === "1";

      setDeviceStatus(isConnected ? "Device Connected ✔" : "Device Not Found ❌");

      log({
        action: "AUTO DETECT",
        init: initRes,
        check: checkRes,
        status: isConnected
      });

    } catch (err) {
      setDeviceStatus("Error detecting device ❌");
      log({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* 🔥 RUN ON LOAD */
  useEffect(() => {
    if (sdkReady) {
      autoDetectDevice();
    }
  }, [sdkReady]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      {/* jQuery */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />

      {/* SDK */}
      <Script
        src="/morfinauth.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("SDK Loaded ✔");
          setSdkReady(true);
        }}
      />

      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl">

        <h1 className="text-2xl font-bold mb-4">
          🧬 Fingerprint Auto Detect
        </h1>

        <p className="text-sm mb-2 text-gray-500">
          SDK: {sdkReady ? "Ready ✔" : "Loading..."}
        </p>

        <p className="text-sm mb-4 font-semibold">
          Device Status: {deviceStatus}
        </p>

        {/* OUTPUT */}
        <div className="bg-black text-green-400 p-3 rounded h-72 overflow-auto text-xs">
          {output ? JSON.stringify(output, null, 2) : "Waiting for detection..."}
        </div>

        {loading && (
          <p className="text-center text-gray-500 mt-2 animate-pulse">
            Detecting fingerprint device...
          </p>
        )}

      </div>
    </div>
  );
}