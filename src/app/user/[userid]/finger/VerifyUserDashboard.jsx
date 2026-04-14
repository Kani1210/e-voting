"use client";

import React from "react";

function VerifyUserDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-pink-950 to-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-pink-400">
          Fingerprint Verified ✔
        </h1>
        <p className="text-gray-300 mt-2">
          User authentication successful
        </p>
      </div>
    </div>
  );
}

export default VerifyUserDashboard;