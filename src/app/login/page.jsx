"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";

import { Eye, EyeOff, Vote, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser(form);

      if (result.success) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        router.push(`/user/${result.user.user_id}`);
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4">
      
      <Card className="w-full max-w-md rounded-2xl shadow-2xl border bg-card">
        
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Vote className="w-9 h-9 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl font-semibold">
            E-Voting Login
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Secure access to your dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* EMAIL */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-11"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2 relative">
              <Label>Password</Label>

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-11 pr-10"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-muted-foreground hover:text-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center">
                {error}
              </p>
            )}

            {/* BUTTON */}
            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2026 Secure Voting System
          </p>
        </CardContent>
      </Card>
    </div>
  );
}