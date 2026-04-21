"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddCandidate({ userid }) {
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    candidate_name: "",
    party_name: "",
    party_symbol: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.candidate_name || !form.party_name) {
      alert("Candidate name and party name are required");
      return;
    }

    console.log("Candidate Saved:", form, "Admin:", userid);

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

    setForm({
      candidate_name: "",
      party_name: "",
      party_symbol: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl bg-white/10 p-6 rounded-xl space-y-3"
    >
      <h2 className="text-lg font-bold text-purple-300">
        Add Candidate - Admin {userid}
      </h2>

      <Input
        name="candidate_name"
        placeholder="Candidate Name"
        value={form.candidate_name}
        onChange={handleChange}
      />

      <Input
        name="party_name"
        placeholder="Party Name"
        value={form.party_name}
        onChange={handleChange}
      />

      <Input
        name="party_symbol"
        placeholder="Party Symbol"
        value={form.party_symbol}
        onChange={handleChange}
      />

      <Button className="w-full" type="submit">
        Save Candidate
      </Button>

      {success && (
        <p className="text-green-400 text-sm">
          ✔ Candidate added successfully!
        </p>
      )}
    </form>
  );
}