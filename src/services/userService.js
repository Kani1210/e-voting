const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

/* ── Auth header helper ─────────────────────────────────────────────── */
const getAuthHeader = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not logged in — no token found in localStorage");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* ── Safe fetch wrapper (handles empty body + Render cold start retry) ── */
const safeFetch = async (url, options, retries = 2) => {
  try {
    const res = await fetch(url, options);
    const text = await res.text();

    console.log(`[${options.method}] ${url}`);
    console.log("HTTP Status:", res.status);
    console.log("Raw body:", text);

    // Empty body — Render cold start, retry automatically
    if ((!text || text.trim() === "") && retries > 0) {
      console.warn(`Empty response — retrying in 5s... (${retries} retries left)`);
      await new Promise((r) => setTimeout(r, 5000));
      return safeFetch(url, options, retries - 1);
    }

    if (!text || text.trim() === "") {
      return {
        success: false,
        error: `Server returned empty response (status ${res.status}). Wait 30s and retry.`,
      };
    }

    // HTML response = proxy/server error
    if (
      text.trimStart().startsWith("<!DOCTYPE") ||
      text.trimStart().startsWith("<html")
    ) {
      return {
        success: false,
        error: `Server returned HTML (status ${res.status}). Check backend logs.`,
      };
    }

    try {
      const json = JSON.parse(text);
      // If backend returned 401, give a clear message
      if (res.status === 401) {
        return { success: false, error: "Session expired — please login again" };
      }
      return json;
    } catch {
      return {
        success: false,
        error: `JSON parse failed. Raw: ${text.substring(0, 200)}`,
      };
    }
  } catch (err) {
    return { success: false, error: "Network error: " + err.message };
  }
};

