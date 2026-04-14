import React from 'react'
import AdminDashboard from './AdminDashboard';

export default async function page({params}) {

  const { userid } = await params; // ❌ no await needed

  console.log("🔥 SERVER PARAM USER:", userid);

  return <AdminDashboard userid={userid} />;
}
