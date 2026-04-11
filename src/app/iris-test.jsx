"use client";

import { useEffect, useState } from "react";

export default function IrisTest() {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const jquery = document.createElement("script");
    jquery.src = "https://code.jquery.com/jquery-3.6.0.min.js";

    jquery.onload = () => {
      const script = document.createElement("script");
      script.src = "/marvisauth.js";

      script.onload = () => {
        setSdkReady(true);
        console.log("SDK Ready ✔");
      };

      document.body.appendChild(script);
    };

    document.body.appendChild(jquery);
  }, []);

  const checkDevice = () => {
    try {
      setLoading(true);
      const res = window.GetMarvisAuthInfo();
      setOutput(res);
    } catch (err) {
      setOutput({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const captureIris = () => {
    try {
      setLoading(true);
      const res = window.CaptureIris(50, 70);
      setOutput(res);
    } catch (err) {
      setOutput({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-6">

      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-6">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🧿 Iris Device Test Panel
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Status:{" "}
            <span className={sdkReady ? "text-green-600" : "text-red-500"}>
              {sdkReady ? "Ready ✔" : "Loading..."}
            </span>
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 justify-center mb-6">

          <button
            onClick={checkDevice}
            disabled={!sdkReady || loading}
            className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50"
          >
            🔍 Check Device
          </button>

          <button
            onClick={captureIris}
            disabled={!sdkReady || loading}
            className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50"
          >
            👁 Capture Iris
          </button>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-500 mb-4 animate-pulse">
            Processing biometric device...
          </div>
        )}

        {/* OUTPUT BOX */}
        <div className="bg-gray-900 text-green-300 p-4 rounded-lg h-80 overflow-auto text-xs shadow-inner">
          {output ? (
            <pre>{JSON.stringify(output, null, 2)}</pre>
          ) : (
            <p className="text-gray-400">
              No data yet. Click a button to test device.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}