const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

/* =========================
   ADD USER
========================= */
export const addUser = async (payload) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { success: false, message: "Token missing" };
  }

  try {
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* =========================
   GET ALL USERS
========================= */
export const getAllUsers = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

/* =========================
   GET USER
========================= */
export const getUserDetails = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

/* =========================
   UPDATE USER
========================= */
export const updateUser = async (id, payload) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return res.json();
};

/* =========================
   DELETE USER
========================= */
export const deleteUser = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};