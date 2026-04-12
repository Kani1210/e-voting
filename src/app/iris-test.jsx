"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { addIris } from "@/services/userService";

export default function IrisAutoDetect() {
  const [output, setOutput] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("Checking...");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const log = (data) => setOutput(data);

  /* ---------------- WAIT FOR SDK ---------------- */
  const waitForSDK = () =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.GetMarvisAuthInfo) {
          clearInterval(interval);
          resolve(true);
        }
      }, 200);
    });

  /* ---------------- IRIS DETECT + SAVE ---------------- */
  const detectIrisDevice = async () => {
    try {
      setLoading(true);

      await waitForSDK();

      const res = window.GetMarvisAuthInfo
        ? window.GetMarvisAuthInfo()
        : null;

      let data = res;

      if (typeof res === "string") {
        try {
          data = JSON.parse(res);
        } catch {
          data = { raw: res };
        }
      }

      console.log("IRIS RESPONSE:", data);

      const isConnected =
        data?.httpStaus === true ||
        data?.ErrorCode === "-2014" ||
        data?.ErrorDescription?.includes("Initialized");

      setDeviceStatus(
        isConnected ? "Iris Device Connected ✔" : "Iris Not Found ❌"
      );

      log({
        action: "IRIS AUTO DETECT",
        raw: res,
        parsed: data,
        status: isConnected,
      });

      /* ---------------- SAVE TO BACKEND ---------------- */
      if (isConnected) {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          console.log("❌ userId not found");
          return;
        }

        const response = await addIris({
          userId: userId,
          irisTemplate: JSON.stringify(data),
        });

        console.log("✔ SAVED TO DB:", response);
        setSaved(true);
      }
    } catch (err) {
      setDeviceStatus("Error detecting iris ❌");
      log({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- AUTO RUN ---------------- */
  useEffect(() => {
    if (sdkReady) {
      detectIrisDevice();
    }
  }, [sdkReady]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      {/* SDK LOAD */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />

      <Script
        src="/marvisauth.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("IRIS SDK Loaded ✔");
          setSdkReady(true);
        }}
      />

      {/* UI BOX */}
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl">

        <h1 className="text-2xl font-bold mb-4">
          👁 Iris Auto Detect System
        </h1>

        <p className="text-sm mb-2 text-gray-500">
          SDK: {sdkReady ? "Ready ✔" : "Loading..."}
        </p>

        <p className="text-sm mb-2 font-semibold">
          Device Status: {deviceStatus}
        </p>

        {saved && (
          <p className="text-green-600 font-bold mb-2">
            ✔ Iris Saved to Database
          </p>
        )}

        {/* OUTPUT */}
        <div className="bg-black text-green-400 p-3 rounded h-72 overflow-auto text-xs">
          {output
            ? JSON.stringify(output, null, 2)
            : "Waiting for iris detection..."}
        </div>

        {loading && (
          <p className="text-center text-gray-500 mt-2 animate-pulse">
            Detecting iris device...
          </p>
        )}

      </div>
    </div>
  );
}