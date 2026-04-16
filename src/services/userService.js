const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

/* =========================
   GET USER DETAILS
========================= */
export const getUserDetails = async (userId) => {
  const token = localStorage.getItem("token");

  if (!userId) return { success: false, message: "UserId missing" };
  if (!token) return { success: false, message: "Token missing" };

  try {
    const res = await fetch(`${API_URL}/users/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

  try {
    const res = await fetch(`${API_URL}/users/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* =========================
   ADD USER (IMPORTANT FIX)
========================= */
export const addUser = async (payload) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/users/user`, {
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
   UPDATE USER
========================= */
export const updateUser = async (userId, payload) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/users/user/${userId}`, {
      method: "PUT",
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
   DELETE USER
========================= */
export const deleteUser = async (userId) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/users/user/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* =========================
   SAVE FINGERPRINT
========================= */
export const saveFingerprint = async (template) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/users/add-finger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ template }),
    });

    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* =========================
   GET FINGERPRINT
========================= */
export const getFingerprint = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/users/get-finger`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* =========================
   SAVE IRIS
========================= */
export const saveIris = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/users/iris/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/* =========================
   GET IRIS
========================= */
export const getIris = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/users/iris/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
};