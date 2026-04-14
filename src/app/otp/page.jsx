"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtp } from "@/services/otpService";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);

    const res = await verifyOtp(email, otp);

    setLoading(false);

    if (res.success) {
      toast.success("OTP verified 🎉");

      localStorage.setItem("token", res.token || "");

      router.push(`/user/${res.user_id}`);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-4 p-6 border rounded-xl">

        <h2 className="text-xl font-semibold text-center">
          OTP Verification
        </h2>

        <p className="text-center text-sm text-gray-500">
          Sent to: {email}
        </p>

        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="text-center text-lg tracking-widest"
        />

        <Button className="w-full" onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

      </div>
    </div>
  );
}