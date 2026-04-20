"use client";

import React, { useEffect, useState } from "react";
import { getMyProfile } from "@/services/userService";
import { castVote } from "@/services/voteService";
import { useRouter } from "next/navigation";

// shadcn dialog
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SuccessDashboard({ userid }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [openDialog, setOpenDialog] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const irisVerified = localStorage.getItem("irisVerified");

      // ✅ KEEP YOUR SECURITY CHECK
      if (!token || !irisVerified) {
        setStatus("Not Verified ❌");
        router.push("/login");
        return;
      }

      try {
        const res = await getMyProfile();
        if (res.success) {
          setUser(res.user);
          setStatus("Verified ✔");
        } else {
          setStatus("Failed to load profile");
        }
      } catch {
        setStatus("Server Error ❌");
      }
    };

    fetchUser();
  }, []);

  // ✅ CAST VOTE
  const handleVote = async () => {
    const res = await castVote();
    setVoteMessage(res.message);
    setOpenDialog(true);
  };

  // ✅ LOGOUT AFTER OK
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        {status}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f2d] text-white flex justify-center p-6">
      <div className="w-full max-w-3xl bg-[#1f1f3a] rounded-2xl p-6 shadow-xl">

        <h1 className="text-2xl font-bold text-center mb-4">
          🎉 Identity Verified Successfully
        </h1>

        <p className="text-center text-green-400 mb-6">{status}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><b>Name:</b> {user.name}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>User ID:</b> {user.user_id}</div>
          <div><b>Voter ID:</b> {user.voter_id}</div>
          <div><b>Phone:</b> {user.phone}</div>
          <div><b>Gender:</b> {user.gender}</div>
          <div><b>Age:</b> {user.age}</div>
          <div><b>DOB:</b> {user.dob}</div>
          <div className="col-span-2">
            <b>Address:</b> {user.address}
          </div>
          <div className="col-span-2">
            <b>Aadhar:</b> {user.aadhar_no}
          </div>
        </div>

        {/* ✅ VOTE BUTTON */}
        <div className="mt-6 text-center">
          <button
            onClick={handleVote}
            className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Proceed to Vote 🗳️
          </button>
        </div>

        {/* ✅ VOTE RESULT DIALOG */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="bg-[#1f1f3a] text-white">
            <DialogHeader>
              <DialogTitle>✅ Vote Status</DialogTitle>
            </DialogHeader>

            <p className="text-center mt-4">{voteMessage}</p>

            <DialogFooter>
              <button
                onClick={handleLogout}
                className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
              >
                OK
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

export default SuccessDashboard;