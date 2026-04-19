"use client";

import React, { useEffect, useState } from "react";
import { getMyProfile } from "@/services/userService";
import { useRouter } from "next/navigation";

function SuccessDashboard({ userid }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const irisVerified = localStorage.getItem("irisVerified");

      // SECURITY CHECK
      if (!token || !irisVerified) {
        setStatus("Not Verified ❌");
        router.push("/login");
        return;
      }

      try {
        const res = await getMyProfile(); // ✅ FIX HERE

        if (res.success) {
          setUser(res.user);
          setStatus("Verified ✔");
        } else {
          setStatus(res.message || "Failed to load profile");
        }
      } catch (err) {
        setStatus("Server Error ❌");
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        {status}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f2d] text-white flex justify-center p-6">
      <div className="w-full max-w-3xl bg-[#1f1f3a] rounded-2xl p-6 shadow-xl">

        <h1 className="text-2xl font-bold text-center mb-4">
          🎉 Identity Verified Successfully
        </h1>

        <p className="text-center text-green-400 mb-6">
          {status}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">

          <div><b>Name:</b> {user.name}</div>
          <div><b>Email:</b> {user.email}</div>

          <div><b>User ID:</b> {user.user_id}</div>
          <div><b>Voter ID:</b> {user.voter_id}</div>

          <div><b>Phone:</b> {user.phone}</div>
          <div><b>Gender:</b> {user.gender}</div>

          <div><b>Age:</b> {user.age}</div>
          <div><b>DOB:</b> {user.dob}</div>

          <div className="col-span-2">
            <b>Address:</b> {user.address}
          </div>

          <div className="col-span-2">
            <b>Aadhar:</b> {user.aadhar_no}
          </div>

          <div>
            <b>Status:</b>{" "}
            <span className="text-green-400">{user.status}</span>
          </div>

          <div>
            <b>Role:</b> {user.role}
          </div>
        </div>

        <div className="mt-6 text-center">
          {/* <button
            onClick={() => router.push(`/user/${user.user_id}/vote`)}
            className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Proceed to Vote 🗳️
          </button> */}
        </div>

      </div>
    </div>
  );
}

export default SuccessDashboard;