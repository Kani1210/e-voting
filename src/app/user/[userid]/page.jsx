import UserDashboard from "./UserDashboard";

export default async function UserPage({ params }) {
  const { userid } = await params; // ❌ no await needed

  console.log("🔥 SERVER PARAM USER:", userid);

  return <UserDashboard userid={userid} />;
}