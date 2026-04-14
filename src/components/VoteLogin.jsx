"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";
import { sendOtp } from "@/services/otpService";

import { toast } from "sonner";

import { Eye, EyeOff, Vote } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import RegisterForm from "@/components/RegisterForm";

export default function VoteLogin() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginUser(form);

    setLoading(false);

    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Login successful 🎉 Sending OTP...");

      const otpRes = await sendOtp(result.user.email);

      if (otpRes.success) {
        toast.success("OTP sent to email 📩");

        router.push(`/otp?email=${result.user.email}`);
      } else {
        toast.error("Failed to send OTP");
      }
    } else {
      toast.error("Login failed ❌");
    }
  };

  return (
    <Card className="w-full shadow-2xl rounded-2xl mt-4">

      {/* HEADER */}
      <CardHeader className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Vote className="w-9 h-9 text-primary" />
          </div>
        </div>

        <CardTitle className="text-2xl font-semibold">
          E-Voting Login
        </CardTitle>
      </CardHeader>

      {/* BODY */}
      <CardContent>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* EMAIL */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter email"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Label>Password</Label>

            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* BUTTON */}
          <Button className="w-full" disabled={loading}>
            {loading ? <Spinner /> : "Login"}
          </Button>

        </form>

        {/* REGISTER */}
        <div className="mt-6 text-center">

          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm text-primary hover:underline">
                Don't have an account? Register
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Account</DialogTitle>
                <DialogDescription>
                  Register to vote
                </DialogDescription>
              </DialogHeader>

              <RegisterForm />
            </DialogContent>
          </Dialog>

        </div>

      </CardContent>
    </Card>
  );
}