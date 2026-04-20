const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

/* =========================
   CAST VOTE
========================= */
export const castVote = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { success: false, message: "Authentication token missing" };
  }

  try {
    const res = await fetch(`${API_URL}/vote/cast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ JWT
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message:
          data.message ||
          data.error ||
          "Failed to cast vote",
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
