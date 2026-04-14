"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Users,
  Vote,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

import { getUserDetails } from "@/services/userService";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserDetails();
        setUser(data);
      } catch (err) {
        setUser(null);
      }
    }

    load();
  }, []);

  // mock extra data
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-violet-400">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              Welcome back, manage voting system 🚀
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-violet-600">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold">Admin</p>
              <p className="text-gray-400">System Control</p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="p-[1px] rounded-2xl bg-gradient-to-r from-violet-600/40 to-pink-600/40"
            >
              <Card className="bg-black/60 backdrop-blur-xl border-none">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{s.label}</p>
                    <p className="text-2xl font-bold text-white">
                      {s.value}
                    </p>
                  </div>
                  <s.icon className="text-violet-400" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* USER INFO */}
          <Card className="bg-black/60 border-white/10">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-lg font-semibold text-violet-300">
                Logged User
              </h2>

              {user ? (
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Name:</span> {user.name}</p>
                  <p><span className="text-gray-400">Email:</span> {user.email}</p>
                  <p><span className="text-gray-400">Role:</span> {user.role || "Admin"}</p>
                </div>
              ) : (
                <p className="text-gray-400">Loading user...</p>
              )}
            </CardContent>
          </Card>

          {/* RECENT VOTES TABLE */}
          <div className="lg:col-span-2">
            <Card className="bg-black/60 border-white/10">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-violet-300 mb-4">
                  Recent Votes
                </h2>

                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Candidate</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {recentVotes.map((v, i) => (
                      <TableRow key={i} className="border-white/10">
                        <TableCell>{v.id}</TableCell>
                        <TableCell>{v.name}</TableCell>
                        <TableCell className="text-violet-300">
                          {v.candidate}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="flex justify-end">
          <Button className="bg-gradient-to-r from-violet-600 to-pink-600">
            System Settings
          </Button>
        </div>

      </div>
    </div>
  );
}