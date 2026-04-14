"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));

    if (!u || u.role !== "admin") {
      window.location.href = "/";
    } else {
      setUser(u);
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return <h1>Welcome Admin: {user.name}</h1>;
}