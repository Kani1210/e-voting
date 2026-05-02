"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ShieldCheck, CreditCard, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser, validateVoter } from "@/services/authService";
import { sendOtp } from "@/services/otpService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function LoginUI() {
  const [tab, setTab] = useState("voter");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);

  const [form, setForm] = useState({ voterId: "", email: "", password: "" });
  const router = useRouter();

  const handleLogin = async () => {

    // ── VOTER LOGIN ──
    if (tab === "voter") {
      if (!form.voterId || !form.email) {
        toast.error("Enter Voter ID and Email");
        return;
      }

      setLoading(true);

      try {
        // STEP 1: Validate voterId + email match in DB first
        const validation = await validateVoter(form.voterId, form.email);

        if (!validation.success) {
          if (validation.isLocked) {
            setLockedOpen(true); // 🔒 show locked popup
          } else {
            // voterId and email do NOT match
            toast.error(validation.message || "Voter ID and Email do not match");
          }
          setLoading(false);
          return;
        }

        // STEP 2: Only send OTP if validation passed
        const otpRes = await sendOtp(form.email);

        if (otpRes.success) {
          toast.success("OTP sent successfully!");
          router.push(`/otp?email=${form.email}&voterId=${form.voterId}`);
        } else {
          toast.error(otpRes.message || "Failed to send OTP");
        }

      } catch (err) {
        toast.error("Server error. Try again.");
      }

      setLoading(false);
      return;
    }

    // ── ADMIN LOGIN ──
    if (!form.email || !form.password) {
      toast.error("Enter Email and Password");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser({ email: form.email, password: form.password });

      if (res.success) {
        toast.success("Login successful!");
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("token", res.token);

        const role = res.user?.role?.toLowerCase();
        const userId = res.user?.id;
        window.location.href = role === "admin" ? `/admin/${userId}` : `/user/${userId}`;
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err) {
      toast.error("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0033] via-[#2b0a4a] to-black px-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <CardContent className="p-8">
            <h1 className="text-4xl font-extrabold text-center text-purple-300">SECUREVOTE</h1>
            <p className="text-center text-gray-300 mt-2 mb-6 text-sm">Access Your Account</p>

            {/* TABS */}
            <div className="flex w-full bg-white/10 p-1 rounded-full mb-6">
              <button type="button" onClick={() => setTab("voter")}
                className={`flex-1 py-2 rounded-full ${tab === "voter" ? "bg-purple-500 text-white" : "text-gray-300"}`}>
                Voter Login
              </button>
              <button type="button" onClick={() => setTab("admin")}
                className={`flex-1 py-2 rounded-full ${tab === "admin" ? "bg-purple-500 text-white" : "text-gray-300"}`}>
                Admin Login
              </button>
            </div>

            {/* INPUTS */}
            <div className="space-y-4">
              {tab === "voter" ? (
                <>
                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                    <CreditCard className="text-purple-300" />
                    <Input placeholder="Voter ID" value={form.voterId}
                      onChange={(e) => setForm({ ...form, voterId: e.target.value })}
                      className="bg-transparent border-none text-white w-full" />
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                    <User className="text-purple-300" />
                    <Input placeholder="Email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-transparent border-none text-white w-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                    <User className="text-purple-300" />
                    <Input placeholder="Email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-transparent border-none text-white w-full" />
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                    <ShieldCheck className="text-purple-300" />
                    <Input type={showPassword ? "text" : "password"} placeholder="Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="bg-transparent border-none text-white w-full" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-purple-300">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </>
              )}
            </div>

            <Button onClick={handleLogin} disabled={loading}
              className="w-full mt-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg py-5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Logging in...
                </span>
              ) : "Login"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* 🔒 LOCKED POPUP */}
      <Dialog open={lockedOpen} onOpenChange={() => {}}>
        <DialogContent className="bg-[#1f1f3a] text-white border border-white/20 rounded-2xl text-center">
          <DialogHeader>
            <DialogTitle className="text-xl text-yellow-400 text-center">🔒 Account Locked</DialogTitle>
            <DialogDescription className="text-gray-300 text-center mt-2">
              Your Voter ID has <strong>already been used</strong> to cast a vote in this election.
              <br /><br />
              Your account is <span className="text-red-400 font-bold">locked</span>.
              <br />Contact the Election Commission to unlock your account.
            </DialogDescription>
          </DialogHeader>
          <div className="text-6xl py-4">🚫</div>
          <DialogFooter>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 rounded-full"
              onClick={() => setLockedOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}