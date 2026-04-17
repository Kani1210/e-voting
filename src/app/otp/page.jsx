import { Suspense } from "react";
import OtpPage from "./OtpClient ";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading OTP page...</div>}>
      <OtpPage />
    </Suspense>
  );
}