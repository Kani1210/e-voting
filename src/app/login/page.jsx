"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";

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

export default function LoginPage() {
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
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Login successful 🎉");

      router.push(`/user/${result.user.user_id}`);
    } else {
      toast.error(result.message || "Login failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4">

      <Card className="w-full max-w-md shadow-2xl rounded-2xl">

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
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter email"
                className="h-11 rounded-xl"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-1 relative">
              <Label>Password</Label>

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="h-11 rounded-xl pr-10"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />

              {/* EYE ICON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* BUTTON */}
            <Button
              className="w-full h-11 rounded-xl text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  Signing in...
                </div>
              ) : (
                "Login"
              )}
            </Button>

          </form>

          {/* REGISTER DIALOG */}
          <div className="mt-6 text-center">

            <Dialog>
              <DialogTrigger asChild>
                <button className="text-sm text-primary hover:underline">
                  Don't have an account? Register
                </button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>🗳️ Create Account</DialogTitle>

                  <DialogDescription>
                    Register to access voting system
                  </DialogDescription>
                </DialogHeader>

                <RegisterForm />
              </DialogContent>
            </Dialog>

          </div>

        </CardContent>
      </Card>
    </div>
  );
}