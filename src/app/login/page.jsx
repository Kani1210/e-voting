"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ShieldCheck, CreditCard, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { toast } from "sonner";

export default function LoginUI1() {
  const [tab, setTab] = useState("voter");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    voterId: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleLogin = async () => {
    if (tab === "voter" && (!form.voterId || !form.email)) {
      toast.error("Enter Voter ID and Email");
      return;
    }

    if (tab === "admin" && (!form.email || !form.password)) {
      toast.error("Enter Email and Password");
      return;
    }

    setLoading(true);

    const payload =
      tab === "voter"
        ? { voterId: form.voterId, email: form.email }
        : { email: form.email, password: form.password };

    try {
      const res = await loginUser(payload);

      if (res.success) {
        toast.success("Login successful!");

        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("token", res.token);

        const role = res.user?.role?.toLowerCase();
const userId = res.user?.id;

        setTimeout(() => {
          if (role === "admin") router.push(`/admin/${userId}`);
          else router.push(`/user/${userId}`);
        }, 800);
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

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <CardContent className="p-8">

            {/* TITLE */}
            <h1 className="text-4xl font-extrabold text-center text-purple-300">
              SECUREVOTE
            </h1>
            <p className="text-center text-gray-300 mt-2 mb-6 text-sm">
              Access Your Account
            </p>

            {/* TABS */}
            <div className="flex w-full bg-white/10 p-1 rounded-full mb-6">
              <button
                type="button"
                onClick={() => setTab("voter")}
                className={`flex-1 py-2 rounded-full ${
                  tab === "voter"
                    ? "bg-purple-500 text-white"
                    : "text-gray-300"
                }`}
              >
                Voter Login
              </button>

              <button
                type="button"
                onClick={() => setTab("admin")}
                className={`flex-1 py-2 rounded-full ${
                  tab === "admin"
                    ? "bg-purple-500 text-white"
                    : "text-gray-300"
                }`}
              >
                Admin Login
              </button>
            </div>

            {/* INPUTS */}
            <div className="space-y-4">

              {tab === "voter" ? (
                <>
                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                    <CreditCard className="text-purple-300" />
                    <Input
                      placeholder="Voter ID"
                      value={form.voterId}
                      onChange={(e) =>
                        setForm({ ...form, voterId: e.target.value })
                      }
                      className="bg-transparent border-none text-white w-full"
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                    <User className="text-purple-300" />
                    <Input
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="bg-transparent border-none text-white w-full"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                    <User className="text-purple-300" />
                    <Input
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="bg-transparent border-none text-white w-full"
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                    <ShieldCheck className="text-purple-300" />

                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="bg-transparent border-none text-white w-full"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-purple-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* BUTTON */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg py-5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}