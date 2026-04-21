const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-voting-backend-u9dk.onrender.com";

// ================= SAFE TOKEN =================
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// ================= COMMON HEADERS =================
const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ================= SAFE FETCH WRAPPER =================
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: data.message || data.error || `HTTP Error ${res.status}`,
        status: res.status,
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      message: "Network error / Server not reachable",
    };
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async () => {
  return await safeFetch(`${API_URL}/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
};

// ================= ADD USER =================
export const addUser = async (payload) => {
  return await safeFetch(`${API_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

// ================= GET SINGLE USER =================
export const getUserDetails = async (id) => {
  return await safeFetch(`${API_URL}/users/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
};

// ================= GET MY PROFILE =================
export const getMyProfile = async () => {
  return await safeFetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
};

// ================= UPDATE USER =================
export const updateUser = async (id, payload) => {
  return await safeFetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
};

// ================= DELETE USER =================
export const deleteUser = async (id) => {
  return await safeFetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

// ================= UNLOCK USER =================
export const unlockUser = async (id) => {
  return await safeFetch(`${API_URL}/users/unlock/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
};

// ================= FINGERPRINT =================
export const saveFingerprint = async (template) => {
  return await safeFetch(`${API_URL}/users/add-finger`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ template }),
  });
};

export const getFingerprint = async () => {
  return await safeFetch(`${API_URL}/users/get-finger`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
};