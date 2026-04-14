"use client";

import { useState } from "react";
import { registerUser } from "@/services/authService";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { User, Mail, Lock, Eye, EyeOff, Users } from "lucide-react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.gender) {
      toast.error("All fields are required ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser(form);

      if (res?.success) {
        toast.success("Registered successfully 🎉");

        if (res?.user?.voter_id) {
          toast.success(`Voter ID: ${res.user.voter_id}`);
        }

        setForm({ name: "", email: "", password: "", gender: "" });
      } else {
        toast.error(res?.message || "Registration failed ❌");
      }
    } catch (err) {
      toast.error("Server error ❌ Try again later");
    }

    setLoading(false);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>

      {/* NAME */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Full Name"
          className="pl-10 h-11 rounded-xl"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={loading}
        />
      </div>

      {/* EMAIL */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Email Address"
          type="email"
          className="pl-10 h-11 rounded-xl"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={loading}
        />
      </div>

      {/* PASSWORD */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

        <Input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          className="pl-10 pr-10 h-11 rounded-xl"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          disabled={loading}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* GENDER - BUTTON GROUP (NEW UX 🔥) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users size={16} />
          Select Gender
        </div>

        <div className="flex gap-3">
          {["male", "female", "other"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm({ ...form, gender: g })}
              className={`px-4 py-2 rounded-xl border text-sm transition-all
                ${
                  form.gender === g
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent hover:bg-gray-100"
                }
              `}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* BUTTON */}
      <Button className="w-full h-11 rounded-xl" disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner />
            Registering...
          </div>
        ) : (
          "Create Account"
        )}
      </Button>

    </form>
  );
}