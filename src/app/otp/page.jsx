"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtp } from "@/services/otpService";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp(email, otp);

      if (res.success) {
        toast.success("OTP Verified!");
        router.push(`/user/${res.user_id}`);
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f2d] px-4">

      <div className="w-full max-w-md bg-[#2a2a4a] rounded-3xl p-8 text-white shadow-2xl border border-white/10">

        {/* ICON */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-full">
            <span className="text-2xl">🔢</span>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center mb-2">
          Verify Your OTP
        </h2>

        {/* EMAIL TEXT */}
        <p className="text-center text-gray-300 text-sm mb-2">
          Enter the code sent to
        </p>

        <p className="text-center text-purple-300 font-semibold mb-4">
          {email}
        </p>

        {/* INFO BOX */}
        <div className="bg-[#3a3a6a] text-center text-sm text-gray-300 py-3 rounded-xl mb-6">
          Check your email for the 6-digit code
        </div>

        {/* OTP BOXES */}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup className="gap-3">
              <InputOTPSlot index={0} className="w-12 h-12 text-lg bg-[#2a2a4a] border border-gray-500" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg bg-[#2a2a4a] border border-gray-500" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg bg-[#2a2a4a] border border-gray-500" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg bg-[#2a2a4a] border border-gray-500" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg bg-[#2a2a4a] border border-gray-500" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg bg-[#2a2a4a] border border-gray-500" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* BUTTON */}
        <Button
          onClick={handleVerify}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-5 text-lg"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        {/* BACK BUTTON */}
        <button
          onClick={() => router.push("/login")}
          className="mt-6 text-gray-400 text-sm flex items-center justify-center gap-2 w-full"
        >
          <ArrowLeft size={16} />
          Back
        </button>

      </div>
    </div>
  );
}