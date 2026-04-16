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
    const res = await fetch(`${API_URL}/otp/send-otp`, { // ✅ FIXED
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || data.error || "Failed to send OTP",
      };
    }

    return data;
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
    const res = await fetch(`${API_URL}/otp/verify-otp`, { // ✅ FIXED
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || data.error || "Failed to verify OTP",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      message: "Network error: " + err.message,
    };
  }
};