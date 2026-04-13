const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

/* =========================
   SAVE FINGERPRINT
========================= */
export const saveFinger = async (template, token) => {
  try {
    const res = await fetch(`${API_URL}/users/add-finger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ template }),
    });

    const text = await res.text();

    if (!text) {
      return { success: false, message: "Empty response from server" };
    }

    return JSON.parse(text);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* =========================
   GET FINGERPRINT
========================= */
export const getFinger = async (token) => {
  try {
    const res = await fetch(`${API_URL}/users/get-finger`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();

    if (!text) {
      return { success: false, message: "Empty response from server" };
    }

    const data = JSON.parse(text);

    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};