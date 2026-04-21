"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Vote,
  LogOut,
  Shield,
} from "lucide-react";

import AddCandidate from "./AddCandidate";
import AddVoter from "./AddVotes";
import ViewusersDashboard from "./ViewusersDashboard";
import AdmintotalDashbaord from "./AdmintotalDashbaord";

export default function AdminDashboard({ userid }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <Shield size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage candidates, users, and voting controls
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200 hover:bg-blue-50">
                Admin ID: {userid}
              </Badge>

              <Button
                onClick={handleLogout}
                className="h-11 rounded-xl bg-red-500 px-5 text-white hover:bg-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-3 rounded-2xl bg-transparent p-0 md:grid-cols-4">
            <TabsTrigger
              value="dashboard"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>

            <TabsTrigger
              value="candidate"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 data-[state=active]:border-violet-600 data-[state=active]:bg-violet-600 data-[state=active]:text-white"
            >
              <Vote className="h-4 w-4" />
              Candidates
            </TabsTrigger>

            <TabsTrigger
              value="voter"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </TabsTrigger>

            <TabsTrigger
              value="users"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 data-[state=active]:border-indigo-600 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              View Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <AdmintotalDashbaord userid={userid} />
            </div>
          </TabsContent>

          <TabsContent value="candidate" className="mt-0">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <AddCandidate userid={userid} />
            </div>
          </TabsContent>

          <TabsContent value="voter" className="mt-0">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <AddVoter userid={userid} />
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <ViewusersDashboard userid={userid} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}