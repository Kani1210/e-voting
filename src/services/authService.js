const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://e-voting-backend-u9dk.onrender.com";

/* LOGIN (Admin) */
export const loginUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* VALIDATE VOTER — checks voterId + email match BEFORE sending OTP */
export const validateVoter = async (voterId, email) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId, email }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* REGISTER */
export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};