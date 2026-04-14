"use client";

import { useState } from "react";
import { registerUser } from "@/services/authService";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { User, Mail, Lock, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser(form);

      if (res.success) {
        toast.success(
          `Registered Successfully 🎉\nVoter ID: ${res.user.voter_id}`
        );

        setForm({ name: "", email: "", password: "" });
      } else {
        toast.error(res.message || "Registration failed ❌");
      }
    } catch (err) {
      toast.error("Server error ❌ Try again later");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* NAME */}
      <div className="relative">
        <User className="absolute left-3 top-3 text-gray-400" size={18} />
        <Input
          placeholder="Full Name"
          className="pl-10"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          disabled={loading}
          required
        />
      </div>

      {/* EMAIL */}
      <div className="relative">
        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
        <Input
          placeholder="Email Address"
          type="email"
          className="pl-10"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          disabled={loading}
          required
        />
      </div>

      {/* PASSWORD */}
      <div className="relative">
        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
        <Input
          placeholder="Password"
          type="password"
          className="pl-10"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          disabled={loading}
          required
        />
      </div>

      {/* BUTTON */}
      <Button className="w-full" disabled={loading}>

        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Create Account"
        )}

      </Button>

    </form>
  );
}