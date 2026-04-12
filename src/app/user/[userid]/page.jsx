"use client";

import FingerprintTest from "@/app/fingerprint-test";
import { useRouter } from "next/navigation";


export default function UserDashboard({ userid }) {
  const router = useRouter();

  const handleLogout = () => {
    // 🧹 clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    // 🔁 redirect to login
    router.push("/login");
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold">User Dashboard</h1>

      <p className="mt-2">User ID: {userid}</p>

      {/* 🔴 LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
      >
        Logout
      </button>

      {/* 🧬 FINGERPRINT SECTION */}
      <div className="mt-6">
       <FingerprintTest />
      </div>

    </div>
  );
}