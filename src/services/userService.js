const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

/* =========================
   GET USER DETAILS
========================= */
export const getUserDetails = async (userId) => {
  const token = localStorage.getItem("token");

  if (!userId) {
    return { success: false, message: "UserId is missing" };
  }

  if (!token) {
    return { success: false, message: "No token found" };
  }

  try {
    const res = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();

    console.log("USER DETAILS RAW:", text);

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
        message: json.message || "Failed to fetch user",
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