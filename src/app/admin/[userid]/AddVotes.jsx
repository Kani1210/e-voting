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
  CreditCard,
  MapPin,
  Hash,
} from "lucide-react";

export default function AddVoter({ userid }) {
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

  const resetForm = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Name, Email, Password required");
      return;
    }

    setLoading(true);

    try {
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
        toast.success("User created successfully");
        resetForm();
      } else {
        toast.error(res?.message || res?.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Add user error:", error);
      toast.error(error?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const baseToggleClass =
    "h-11 rounded-xl border px-4 text-sm font-medium transition-all";
  const inactiveToggleClass =
    "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Create User
            </h2>
            <p className="text-sm text-slate-500">
              Add a voter or admin account for dashboard ID {userid}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Age
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="age"
                type="number"
                placeholder="Enter age"
                value={form.age}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Aadhar Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="aadhar_no"
                placeholder="Enter Aadhar number"
                value={form.aadhar_no}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                name="address"
                placeholder="Enter address"
                value={form.address}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Users className="h-4 w-4 text-slate-500" />
              Gender
            </label>
            <div className="flex flex-wrap gap-2">
              {["male", "female", "other"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, gender: g }))}
                  className={`${baseToggleClass} ${
                    form.gender === g
                      ? "border-blue-600 bg-blue-600 text-white"
                      : inactiveToggleClass
                  }`}
                >
                  {g.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              Role
            </label>
            <div className="flex flex-wrap gap-2">
              {["voter", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: r }))}
                  className={`${baseToggleClass} ${
                    form.role === r
                      ? "border-violet-600 bg-violet-600 text-white"
                      : inactiveToggleClass
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <BadgeCheck className="h-4 w-4 text-slate-500" />
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {["active", "inactive"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`${baseToggleClass} ${
                    form.status === s
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : inactiveToggleClass
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="h-11 rounded-xl border-slate-200 text-slate-700"
          >
            Reset
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 min-w-[180px] rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Creating...
              </div>
            ) : (
              "Create User"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}