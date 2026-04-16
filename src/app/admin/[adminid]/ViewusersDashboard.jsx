"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/services/userService";
import UserView from "./UserView";

export default function ViewusersDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await getAllUsers();
      if (res.success) setUsers(res.users);
    };

    load();
  }, []);

  const handleView = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Users</h2>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id || u.user_id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.status}</td>
              <td>
                <button onClick={() => handleView(u)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <UserView
        open={open}
        onClose={() => setOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}