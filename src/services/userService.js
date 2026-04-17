const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

// SAFE TOKEN
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// ================= GET ALL USERS =================
export const getAllUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message };
    }

    return data;
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

// ================= GET USER =================
export const getUserDetails = async (id) => {
  try {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await res.json();

    console.log("API RESPONSE:", data);

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Request failed",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      message: "Network error",
    };
  }
};

// ================= UPDATE USER =================
export const updateUser = async (id, payload) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
};

// ================= DELETE USER =================
export const deleteUser = async (id) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  return await res.json();
};

// ================= FINGERPRINT =================
export const saveFingerprint = async (template) => {
  const res = await fetch(`${API_URL}/users/add-finger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ template }),
  });

  return await res.json();
};

export const getFingerprint = async () => {
  const res = await fetch(`${API_URL}/users/get-finger`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  return await res.json();
};