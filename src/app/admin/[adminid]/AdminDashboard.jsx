"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AddVoter from "./AddVotes";
import AddCandidate from "./AddCandidate";

export default function AdminDashboard() {
  const router = useRouter();
  const { userid } = useParams();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
    sessionStorage.clear();

    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white">

      {/* TOP BAR */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/40">

        <div className="text-lg font-bold tracking-wide">
          <span className="text-violet-400">USER</span>{" "}
          <span className="text-white">DASHBOARD</span>
          <span className="text-gray-400 ml-2 text-sm">/ {userid}</span>
        </div>

        <Button
          variant="destructive"
          className="rounded-none px-6"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      {/* BODY */}
      <div className="p-6">

        <Tabs defaultValue="dashboard" className="w-full">

          {/* ================= TAB BAR (MODERN RECTANGLE STYLE) ================= */}
          <TabsList className="flex h-11 w-fit p-1 rounded-none bg-[#0a0a12] border border-white/10 overflow-hidden">

            <TabsTrigger
              value="dashboard"
              className="
                px-6 h-9 rounded-none text-sm font-medium
                text-gray-300 transition-all duration-200
                hover:bg-white/10 hover:text-white

                data-[state=active]:text-white
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-violet-600
                data-[state=active]:to-indigo-600
              "
            >
              Dashboard
            </TabsTrigger>

            <TabsTrigger
              value="voter"
              className="
                px-6 h-9 rounded-none text-sm font-medium
                text-gray-300 transition-all duration-200
                hover:bg-white/10 hover:text-white

                data-[state=active]:text-white
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-pink-600
                data-[state=active]:to-rose-600
              "
            >
              Add Voter
            </TabsTrigger>

            <TabsTrigger
              value="candidate"
              className="
                px-6 h-9 rounded-none text-sm font-medium
                text-gray-300 transition-all duration-200
                hover:bg-white/10 hover:text-white

                data-[state=active]:text-white
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-cyan-600
                data-[state=active]:to-blue-600
              "
            >
              Add Candidate
            </TabsTrigger>

          </TabsList>

          {/* ================= DASHBOARD ================= */}
          <TabsContent value="dashboard" className="mt-6">

            <div className="grid md:grid-cols-4 gap-4">

              <Card title="Total Users" value="1240" />
              <Card title="Active Sessions" value="890" />
              <Card title="System Role" value="User" />
              <Card title="Status" value="Active" />

            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">

              <div className="p-5 border border-white/10 bg-white/5">
                <h3 className="text-violet-300 font-semibold mb-3">
                  User Profile
                </h3>
                <p className="text-gray-300 text-sm">ID: {userid}</p>
                <p className="text-gray-300 text-sm">Role: User</p>
                <p className="text-gray-300 text-sm">Status: Active</p>
              </div>

              <div className="p-5 border border-white/10 bg-white/5">
                <h3 className="text-violet-300 font-semibold mb-3">
                  Recent Activity
                </h3>

                <p className="text-sm text-gray-300">Login successful</p>
                <p className="text-sm text-gray-300">Profile updated</p>
                <p className="text-sm text-gray-300">Session active</p>
              </div>

            </div>

          </TabsContent>

          {/* ================= VOTER ================= */}
          <TabsContent value="voter" className="mt-6">
            <AddVoter />
          </TabsContent>

          {/* ================= CANDIDATE ================= */}
          <TabsContent value="candidate" className="mt-6">
            <AddCandidate />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

/* ================= CARD ================= */
function Card({ title, value }) {
  return (
    <div className="p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}