"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserDetails } from "@/services/userService";

import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FingerprintApp from "@/app/fingerprint-test";
import IrisSystem from "@/app/iris-test";
import { User } from "lucide-react";
import UserFingureorIris from "./UserFingureorIris";

export default function UserDashboard1() {
  const { userid } = useParams();

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);

      const res = await getUserDetails(userid);

      console.log("API RESPONSE:", res);

      if (!res) {
        setError("User not found");
        setUser(null);
      } else {
        setUser(res); // ✅ DIRECT SET (IMPORTANT FIX)
      }

      setLoading(false);
    };

    if (userid) loadUser();
  }, [userid]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-pink-950 to-black flex justify-center p-4 pt-10">

      <div className="w-full max-w-3xl space-y-4">

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-white">
            <Spinner className="h-6 w-6" />
            <p>Loading user...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : user ? (
          <>
            {/* USER CARD */}
            <Card className="bg-pink-950/40 border border-pink-500/30">
              <CardContent className="flex justify-between p-4 text-white">

                <div>
                  <p className="text-xs text-pink-200">ID</p>
                  <p className="font-semibold">{user.user_id}</p>
                </div>

                <div>
                  <p className="text-xs text-pink-200">NAME</p>
                  <p className="font-semibold">{user.name}</p>
                </div>

                <div>
                  <p className="text-xs text-pink-200">EMAIL</p>
                  <p className="font-semibold">{user.email}</p>
                </div>

                <Badge className="bg-pink-600">ACTIVE</Badge>

              </CardContent>
            </Card>

            {/* BIOMETRICS */}
            <Card>
              <CardContent className="p-2">
                <FingerprintApp />
                <IrisSystem />
              </CardContent>
            </Card>

          </>
        ) : null}
      </div>
      <UserFingureorIris/>
    </div>
  );
}