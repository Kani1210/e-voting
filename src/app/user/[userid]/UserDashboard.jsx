"use client";

import { useEffect, useState } from "react";
import { getUserDetails } from "@/services/userService";
import FingerprintApp from "@/app/fingerprint-test";

export default function UserDashboard({ userid }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const res = await getUserDetails(userid);

      if (res.success === false) {
        console.log(res.message);
      } else {
        setUser(res);
      }
    };

    loadUser();
  }, [userid]);

  return (
    <div style={{ padding: 30 }}>
      <h2>User Profile Page</h2>

      {!user ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p><b>User ID:</b> {user.user_id}</p>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
          <p><b>Status:</b> {user.status}</p>
        </div>
      )}
    </div>
  );
}