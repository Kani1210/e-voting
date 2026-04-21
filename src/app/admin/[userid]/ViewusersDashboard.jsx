"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Mail, ShieldCheck } from "lucide-react";
import UserView from "./UserView";

export default function ViewusersDashboard({ userid }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllUsers();
        if (res?.success) {
          setUsers(res.users || []);
        }
      } catch (error) {
        console.error("Load users error:", error);
      }
    };

    load();
  }, []);

  const handleView = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
          <Users className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">Users List</h2>
          <p className="text-sm text-slate-500">
            View all registered users for admin ID {userid}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Name
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Role
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((u, index) => (
                  <tr
                    key={u.id || u.user_id || index}
                    className="border-t border-slate-200 hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">
                      {u.name || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {u.email || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-violet-100 text-violet-700 hover:bg-violet-100"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        {u.role || "voter"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          u.status === "active"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                        }`}
                      >
                        {u.status || "inactive"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4">
                      <Button
                        onClick={() => handleView(u)}
                        className="h-9 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserView
        open={open}
        onClose={() => setOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}