"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtp } from "@/services/otpService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const voterId = searchParams.get("voterId");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      toast.error("Enter OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp(email, otp);

      if (res.success) {
        toast.success("OTP Verified!");

        // ✅ redirect to user page
        router.push(`/user/${res.user.user_id}`);
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white/10 p-8 rounded-xl w-[350px]">

        <h2 className="text-2xl mb-4 text-center">Enter OTP</h2>

        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mb-4 text-black"
        />

        <Button onClick={handleVerify} className="w-full">
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

      </div>
    </div>
  );
}