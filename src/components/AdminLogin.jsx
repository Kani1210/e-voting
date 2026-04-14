"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();

    if (email === "admin@gmail.com" && password === "admin123") {
      alert("Admin Login Success");
    } else {
      alert("Invalid Admin");
    }
  };

  return (
    <form onSubmit={handleAdminLogin} className="space-y-3 mt-4">
      
      <input
        type="email"
        placeholder="Admin Email"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border"
      />

      <button className="w-full bg-black text-white p-2">
        Login as Admin
      </button>

    </form>
  );
}