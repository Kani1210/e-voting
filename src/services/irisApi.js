// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   "https://e-voting-backend-u9dk.onrender.com";

// /* ENROLL */
// export const enrollIrisAPI = async (irisBase64, token) => {
//   const res = await fetch(`${API_URL}/iris/add`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       irisImage: irisBase64,
//     }),
//   });

//   return res.json();
// };

// /* VERIFY */
// export const verifyIrisAPI = async (irisBase64, token) => {
//   const res = await fetch(`${API_URL}/iris/verify`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       irisImage: irisBase64,
//     }),
//   });

//   return res.json();
// };