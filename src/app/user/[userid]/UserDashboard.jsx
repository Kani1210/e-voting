"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, Eye } from "lucide-react";

export default function UserDashboard({ userid }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

        {/* FINGERPRINT CARD */}
        <Card className="rounded-2xl shadow-xl border hover:shadow-2xl transition-all duration-300 bg-white">
          <CardContent className="p-8 text-center space-y-6">

            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-blue-100">
                <Fingerprint className="w-10 h-10 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Fingerprint Authentication
              </h2>

              <p className="text-gray-500 text-sm">
                Scan and verify your fingerprint securely
              </p>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl"
              onClick={() => router.push(`/user/${userid}/finger`)}
            >
              Open Fingerprint
            </Button>

          </CardContent>
        </Card>

        {/* IRIS CARD */}
        <Card className="rounded-2xl shadow-xl border hover:shadow-2xl transition-all duration-300 bg-white">
          <CardContent className="p-8 text-center space-y-6">

            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-purple-100">
                <Eye className="w-10 h-10 text-purple-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Iris Authentication
              </h2>

              <p className="text-gray-500 text-sm">
                Capture and verify iris for identity check
              </p>
            </div>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl"
              onClick={() => router.push(`/user/${userid}/iris`)}
            >
              Open Iris
            </Button>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}