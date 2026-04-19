import SuccessDashbaord from "./SuccessDashbaord";


export default async function page({ params }) {
  const { userid } = await params; // ❌ no await needed

  console.log("🔥 SERVER PARAM USER:", userid);

  return <SuccessDashbaord userid={userid} />;
}