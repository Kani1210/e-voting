"use client";

import { useState } from "react";
import { addUser } from "@/services/userService";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import {
  User,
  Mail,
  Lock,
  Phone,
  Users,
  UserCog,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

export default function AddVoter() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    phone: "",
    address: "",
    aadhar_no: "",
    role: "voter",
    status: "active",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FRONTEND VALIDATION
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error("Name, Email, Password required ❌");
      return;
    }

    setLoading(true);

    try {
      // ✅ CLEAN PAYLOAD (NO undefined / empty crash)
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        gender: form.gender || null,
        age: form.age ? Number(form.age) : null,
        phone: form.phone || null,
        address: form.address || null,
        aadhar_no: form.aadhar_no || null,
        role: form.role || "voter",
        status: form.status || "active",
      };

      const res = await addUser(payload);

      if (res?.success) {
        toast.success("User created successfully 🎉");

        setForm({
          name: "",
          email: "",
          password: "",
          gender: "",
          age: "",
          phone: "",
          address: "",
          aadhar_no: "",
          role: "voter",
          status: "active",
        });
      } else {
        toast.error(res?.message || res?.error || "Failed ❌");
      }
    } catch (err) {
      toast.error("Server error ❌");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6 backdrop-blur-md"
    >
      {/* TITLE */}
      <div className="flex items-center gap-2">
        <UserCog className="text-violet-400" />
        <h2 className="text-2xl font-bold text-white">
          Create User (Voter / Admin)
        </h2>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* NAME */}
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={18} />
          <Input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="pl-10 h-11 bg-white/5 border-white/10"
          />
        </div>

        {/* EMAIL */}
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="pl-10 h-11 bg-white/5 border-white/10"
          />
        </div>

        {/* PASSWORD */}
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="pl-10 h-11 bg-white/5 border-white/10"
          />
        </div>

        {/* PHONE */}
        <div className="relative">
          <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
          <Input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="pl-10 h-11 bg-white/5 border-white/10"
          />
        </div>

        {/* AGE */}
        <Input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="h-11 bg-white/5 border-white/10"
        />

        {/* GENDER */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Users size={16} /> Gender
          </span>

          <div className="flex gap-3">
            {["male", "female", "other"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, gender: g }))
                }
                className={`px-4 py-2 rounded-xl border text-sm transition ${
                  form.gender === g
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-transparent border-white/10 text-gray-300"
                }`}
              >
                {g.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* AADHAR */}
        <Input
          name="aadhar_no"
          placeholder="Aadhar Number"
          value={form.aadhar_no}
          onChange={handleChange}
          className="h-11 bg-white/5 border-white/10"
        />

        {/* ADDRESS */}
        <Input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="h-11 bg-white/5 border-white/10"
        />
      </div>

      {/* ROLE + STATUS */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* ROLE */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <ShieldCheck size={16} /> Role
          </span>

          <div className="flex gap-3">
            {["voter", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, role: r }))
                }
                className={`px-4 py-2 rounded-xl border text-sm transition ${
                  form.role === r
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-transparent border-white/10 text-gray-300"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <BadgeCheck size={16} /> Status
          </span>

          <div className="flex gap-3">
            {["active", "inactive"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, status: s }))
                }
                className={`px-4 py-2 rounded-xl border text-sm transition ${
                  form.status === s
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-transparent border-white/10 text-gray-300"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-90"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner />
            Creating...
          </div>
        ) : (
          "Create User"
        )}
      </Button>
    </form>
  );
}