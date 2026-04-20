"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddCandidate() {
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl bg-white/10 p-6 rounded-xl space-y-3">
      <h2 className="text-lg font-bold text-purple-300">
        Add Candidate
      </h2>

      <Input placeholder="Candidate Name" />
      <Input placeholder="Party Name" />
      <Input placeholder="Party Symbol" />

      <Button className="w-full" onClick={handleSubmit}>
        Save Candidate
      </Button>

      {success && (
        <p className="text-green-400 text-sm">
          ✔ Candidate added successfully!
        </p>
      )}
    </div>
  );
}