"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function UserDashboard() {
  const { userid } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        User Dashboard
      </h1>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p><b>URL User ID:</b> {userid}</p>

        {user && (
          <>
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
          </>
        )}
      </div>
    </div>
  );
}