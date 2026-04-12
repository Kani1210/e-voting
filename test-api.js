// Test script to check login API
const loginUser = async (data) => {
  const res = await fetch("https://e-voting-backend-u9dk.onrender.com/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

(async () => {
  const result = await loginUser({ email: "kishorevijay0010@gmail.com", password: "123456" });
  console.log("API Response:", result);
})();