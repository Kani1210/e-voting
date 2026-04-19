"use client";

import { useRouter } from "next/navigation";
import FingerprintDashboard from "./finger/fingerDashboard";

export default function UserDashboard({ userid }) {
  const router = useRouter();

  return (
    <div>
      <FingerprintDashboard userid={userid} />
    </div>
  );
}