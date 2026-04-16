"use client";

import { useEffect } from "react";

export default function SDKLoader() {
  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });

    async function init() {
      // 1. Load jQuery
      await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");

      // 2. Load your iris SDK
      await loadScript("/morfinauth.js");
    }

    init();
  }, []);

  return null;
}