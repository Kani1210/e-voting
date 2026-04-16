"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getUserDetails } from "@/services/userService";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FingerprintApp from "@/app/fingerprint-test";

export default function UserDashboard({ userid }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const res = await getUserDetails(userid);

      console.log("USER API RESPONSE:", res);

      if (res) {
        setUser(res);
      }
    };

    loadUser();
  }, [userid]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // adjust if you use different key
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-pink-950 to-black flex justify-center p-4 pt-10">
      <div className="w-full max-w-3xl space-y-4">

        {/* LOADING */}
        {!user ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-2 text-white">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <>
            {/* USER CARD */}
            <Card className="bg-pink-950/40 border border-pink-500/30 backdrop-blur-md shadow-lg">
              <CardContent className="flex items-center justify-between p-4 text-white">

                <div>
                  <p className="text-[10px] text-pink-200">ID</p>
                  <p className="text-sm font-semibold">{user.user_id}</p>
                </div>

                <div>
                  <p className="text-[10px] text-pink-200">NAME</p>
                  <p className="text-sm font-semibold">{user.name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-pink-600 text-white text-xs px-2 py-0.5">
                    ACTIVE
                  </Badge>

                  <button
                    onClick={handleLogout}
                    className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Logout
                  </button>
                </div>

              </CardContent>
            </Card>

            {/* FINGERPRINT */}
            <Card>
              <CardContent className="p-2">
                <FingerprintApp />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}