const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://e-voting-backend-u9dk.onrender.com";
// Example:
// http://localhost:5000
// OR https://e-voting-backend-u9dk.onrender.com

/* =========================
   CREATE USER
========================= */
export const createUser = async (payload) => {
  try {
    const res = await fetch(`${BASE_URL}/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/* =========================
   ADD IRIS
========================= */
export const addIris = async (payload) => {
  try {
    const res = await fetch(`${BASE_URL}/add-iris`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/* =========================
   ADD FINGERPRINT
========================= */
export const addFinger = async (payload) => {
  try {
    const res = await fetch(`${BASE_URL}/add-finger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/* =========================
   GET ALL USERS
========================= */
export const getUsers = async () => {
  try {
    const res = await fetch(`${BASE_URL}/users`);
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/* =========================
   GET SINGLE USER
========================= */
export const getUser = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/user/${userId}`);
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};