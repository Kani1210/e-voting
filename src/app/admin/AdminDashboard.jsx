"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Users,
  Vote,
  ShieldCheck,
  BarChart3,
  LogOut,
  PlusCircle,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";

import { getUserDetails } from "@/services/userService";

export default function AdminDashboard() {
  const router = useRouter();

  // FIX: initialize properly so UI never shows empty
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getUserDetails();

        // handle different API shapes safely
        const data = res?.user || res;

        setUser({
          name: data?.name || "Admin",
          email: data?.email || "admin@securevote.com",
          role: data?.role || "Super Admin",
        });
      } catch (err) {
        setUser({
          name: "Admin",
          email: "admin@securevote.com",
          role: "Super Admin",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const stats = [
    { label: "Total Voters", value: 1240, icon: Users },
    { label: "Votes Cast", value: 890, icon: Vote },
    { label: "Admins", value: 5, icon: ShieldCheck },
    { label: "Turnout %", value: "71%", icon: BarChart3 },
  ];

  const recentVotes = [
    { id: "USR101", name: "Kishore", candidate: "Alice" },
    { id: "USR102", name: "Arjun", candidate: "John" },
    { id: "USR103", name: "Meena", candidate: "Sara" },
  ];

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0033] via-[#2b0a4a] to-black text-white p-6">

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-300">
            SecureVote Admin Panel
          </h1>
          <p className="text-gray-400 text-sm">
            Welcome back, manage elections securely
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-purple-600 text-white">
              AD
            </AvatarFallback>
          </Avatar>

          <div className="text-sm">
            {loading ? (
              <p className="text-gray-400">Loading admin...</p>
            ) : (
              <>
                <p className="font-semibold">{user.name}</p>
                <p className="text-gray-400">{user.role}</p>
              </>
            )}
          </div>

          <Button
            onClick={logout}
            className="ml-4 bg-red-500 hover:bg-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }}>
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                </div>
                <s.icon className="text-purple-400" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PROFILE */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
          <CardContent className="p-6 space-y-2">
            <h2 className="text-lg font-semibold text-purple-300">
              Admin Profile
            </h2>

            {loading ? (
              <p className="text-gray-400">Loading profile...</p>
            ) : (
              <>
                <p><span className="text-gray-400">Name:</span> {user.name}</p>
                <p><span className="text-gray-400">Email:</span> {user.email}</p>
                <p><span className="text-gray-400">Role:</span> {user.role}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* RECENT VOTES */}
        <Card className="lg:col-span-2 bg-white/10 border-white/20 backdrop-blur-xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-purple-300 mb-4">
              Recent Votes
            </h2>

            <div className="space-y-3">
              {recentVotes.map((v, i) => (
                <div
                  key={i}
                  className="flex justify-between bg-black/30 p-3 rounded-xl"
                >
                  <span>{v.name}</span>
                  <span className="text-purple-300">{v.candidate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <UserPlus className="w-4 h-4 mr-2" /> Add Voter
        </Button>

        <Button className="bg-pink-600 hover:bg-pink-700">
          <PlusCircle className="w-4 h-4 mr-2" /> Add Candidate
        </Button>

        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Vote className="w-4 h-4 mr-2" /> Add Votes
        </Button>

        <Button
          onClick={() => router.push("/admin/dashboard")}
          className="bg-white/10 border border-white/20"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
        </Button>
      </div>

    </div>
  );
}