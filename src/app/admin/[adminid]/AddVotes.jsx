"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AddVoter() {
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl bg-white/10 border border-white/10 p-6 rounded-2xl"
    >
      <h2 className="text-xl font-bold text-purple-300 mb-4">
        Add New Voter
      </h2>

      <div className="grid md:grid-cols-2 gap-3">
        <Input placeholder="Full Name" />
        <Input placeholder="Age" />
        <Input placeholder="Phone Number" />
        <Input placeholder="Email Address" />
        <Input placeholder="Aadhar Number" />
        <Input placeholder="Address" />
        <Input placeholder="Location" />
        <Input placeholder="Password" />
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
      >
        Save Voter
      </Button>

      {success && (
        <p className="text-green-400 text-sm mt-2">
          ✔ Voter added successfully!
        </p>
      )}
    </motion.div>
  );
}