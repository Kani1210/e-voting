"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getUserDetails, updateUser, unlockUser } from "@/services/userService";
import { toast } from "sonner";

import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  CreditCard,
  Lock,
  Unlock,
  Save,
  Pencil,
} from "lucide-react";

export default function UserView({ open, onClose, user }) {
  const [userDetails, setUserDetails] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    role: "voter",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!open || !user?.id) return;

    const loadUserDetails = async () => {
      setLoading(true);

      try {
        const res = await getUserDetails(user.id);

        if (res?.success && res?.user) {
          setUserDetails(res.user);
          setForm({
            name: res.user.name || "",
            email: res.user.email || "",
            phone: res.user.phone || "",
            address: res.user.address || "",
            status: res.user.status || "active",
            role: res.user.role || "voter",
          });
        } else {
          toast.error(res?.message || "Failed to load user details");
        }
      } catch (error) {
        console.error("Load user error:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    loadUserDetails();
  }, [open, user]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!userDetails?.id) return;

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        status: form.status,
        role: form.role,
      };

      const res = await updateUser(userDetails.id, payload);

      if (res?.success) {
        toast.success("User updated successfully");
        const updatedUser = res.user || { ...userDetails, ...payload };

        setUserDetails(updatedUser);
        setForm({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          address: updatedUser.address || "",
          status: updatedUser.status || "active",
          role: updatedUser.role || "voter",
        });
        setEditMode(false);
      } else {
        toast.error(res?.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async () => {
    if (!userDetails?.id) return;

    setUnlocking(true);

    try {
      const res = await unlockUser(userDetails.id);

      if (res?.success) {
        toast.success(res?.message || "User unlocked successfully");

        setUserDetails((prev) => ({
          ...prev,
          ...res.user,
          is_locked: false,
        }));
      } else {
        toast.error(res?.message || "Failed to unlock user");
      }
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error("Failed to unlock user");
    } finally {
      setUnlocking(false);
    }
  };

  if (!open || !user) return null;

  const currentUser = userDetails || user;
  const isLocked = currentUser?.is_locked === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editMode ? "Edit User Account" : "User Account Details"}
            </h2>
            <p className="text-sm text-slate-500">
              View, edit, and unlock the selected user account
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex items-center gap-2 text-slate-600">
              <Spinner className="h-5 w-5" />
              Loading user details...
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {/* Name */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <User className="h-4 w-4" />
                  Name
                </label>
                {editMode ? (
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="h-11 rounded-xl border-slate-200"
                  />
                ) : (
                  <p className="font-medium text-slate-900">{currentUser.name || "-"}</p>
                )}
              </div>

              {/* Email */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                {editMode ? (
                  <Input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="h-11 rounded-xl border-slate-200"
                  />
                ) : (
                  <p className="font-medium text-slate-900">{currentUser.email || "-"}</p>
                )}
              </div>

              {/* Phone */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                {editMode ? (
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="h-11 rounded-xl border-slate-200"
                  />
                ) : (
                  <p className="font-medium text-slate-900">{currentUser.phone || "-"}</p>
                )}
              </div>

              {/* Address */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4" />
                  Address
                </label>
                {editMode ? (
                  <Input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="h-11 rounded-xl border-slate-200"
                  />
                ) : (
                  <p className="font-medium text-slate-900">{currentUser.address || "-"}</p>
                )}
              </div>

              {/* Role */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <ShieldCheck className="h-4 w-4" />
                  Role
                </label>

                {editMode ? (
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="voter">Voter</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                    {currentUser.role || "voter"}
                  </Badge>
                )}
              </div>

              {/* Status */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <BadgeCheck className="h-4 w-4" />
                  Status
                </label>

                {editMode ? (
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <Badge
                    className={
                      currentUser.status === "active"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                    }
                  >
                    {currentUser.status || "inactive"}
                  </Badge>
                )}
              </div>

              {/* Lock Status */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  {isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                  Account Lock
                </p>

                {isLocked ? (
                  <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                    <Lock className="mr-1 h-3.5 w-3.5" />
                    Locked
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <Unlock className="mr-1 h-3.5 w-3.5" />
                    Unlocked
                  </Badge>
                )}
              </div>

              {/* Aadhar */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  Aadhar Number
                </p>
                <p className="font-medium text-slate-900">
                  {currentUser.aadhar_no || "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              {!editMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Account
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}

              {isLocked && (
                <Button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {unlocking ? (
                    <div className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Unlocking...
                    </div>
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Unlock Account
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={onClose}
                variant="outline"
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}