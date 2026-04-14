const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

/* =========================
   SEND OTP
========================= */
export const sendOtp = async (email) => {
  if (!email) {
    return { success: false, message: "Email is required" };
  }

  try {
    const res = await fetch(`${API_URL}/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const text = await res.text();

    console.log("SEND OTP RAW:", text);

    if (!text || text.trim() === "") {
      return {
        success: false,
        message: "Empty response from server",
      };
    }

    if (text.startsWith("<!DOCTYPE")) {
      return {
        success: false,
        message: "Server error (HTML response)",
      };
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: "Invalid JSON response",
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: json.message || "Failed to send OTP",
      };
    }

    return json;
  } catch (err) {
    return {
      success: false,
      message: "Network error: " + err.message,
    };
  }
};

/* =========================
   VERIFY OTP
========================= */
export const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    return { success: false, message: "Email and OTP required" };
  }

  try {
    const res = await fetch(`${API_URL}/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const text = await res.text();

    console.log("VERIFY OTP RAW:", text);

    if (!text || text.trim() === "") {
      return {
        success: false,
        message: "Empty response from server",
      };
    }

    if (text.startsWith("<!DOCTYPE")) {
      return {
        success: false,
        message: "Server error (HTML response)",
      };
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: "Invalid JSON response",
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: json.message || "Failed to verify OTP",
      };
    }

    return json;
  } catch (err) {
    return {
      success: false,
      message: "Network error: " + err.message,
    };
  }
};