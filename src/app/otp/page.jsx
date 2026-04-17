import { Suspense } from "react";

import OtpClient from "./OtpClient ";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading OTP page...</div>}>
      <OtpClient />
    </Suspense>
  );
}