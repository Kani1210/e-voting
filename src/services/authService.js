const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

export const loginUser = async (data) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    console.log("Login raw response:", text);

    if (!text || text.trim() === "") {
      return { success: false, message: "Server is waking up — wait 30 seconds and try again" };
    }

    const json = JSON.parse(text);
    return json;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      return { success: false, message: "Server is waking up — wait 30 seconds and try again" };
    }
    return { success: false, message: "Network error: " + error.message };
  }
};

export const registerUser = async (data) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    console.log("Register raw response:", text);

    if (!text || text.trim() === "") {
      return { success: false, message: "Server is waking up — wait 30 seconds and try again" };
    }

    return JSON.parse(text);

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      return { success: false, message: "Server is waking up — wait 30 seconds and try again" };
    }
    return { success: false, message: "Network error: " + error.message };
  }
};