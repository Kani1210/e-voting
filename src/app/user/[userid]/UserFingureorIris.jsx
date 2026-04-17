// "use client";

// import { useRouter } from "next/navigation";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// export default function UserFingureorIris1() {
//   const router = useRouter();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">

//         {/* FINGERPRINT */}
//         <Card className="p-6 text-center shadow-lg">
//           <CardContent className="space-y-4">
//             <h2 className="text-xl font-bold">Fingerprint</h2>

//             <div className="h-40 bg-gray-200 rounded flex items-center justify-center">
//               <span className="text-gray-500">Fingerprint Image</span>
//             </div>

//             <Button
//               className="w-full"
//               onClick={() => router.push("/FingerprintDev")}
//             >
//               Select Fingerprint
//             </Button>
//           </CardContent>
//         </Card>

//         {/* IRIS */}
//         <Card className="p-6 text-center shadow-lg">
//           <CardContent className="space-y-4">
//             <h2 className="text-xl font-bold">Iris</h2>

//             <div className="h-40 bg-gray-200 rounded flex items-center justify-center">
//               <span className="text-gray-500">Iris Image</span>
//             </div>

//             <Button
//               className="w-full bg-purple-600"
//               onClick={() => router.push("/IrisDev")}
//             >
//               Select Iris
//             </Button>
//           </CardContent>
//         </Card>

//       </div>
//     </div>
//   );
// }