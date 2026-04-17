const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

// 🔐 GET TOKEN
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/* =========================
   SAVE FINGERPRINT
========================= */
export const saveFinger = async (template) => {
  try {
    const token = getToken();

    const res = await fetch(`${API_URL}/fingerprint/add-finger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ template }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* =========================
   GET FINGERPRINT
========================= */
export const getFinger = async () => {
  try {
    const token = getToken();

    const res = await fetch(`${API_URL}/fingerprint/get-finger`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || "No fingerprint found",
      };
    }

    return {
      success: true,
      template: data.template,
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};