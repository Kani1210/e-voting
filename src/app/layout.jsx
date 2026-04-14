import Script from "next/script";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css"; 
import { Toaster } from "sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>

        {/* ✅ LOAD jQuery FIRST */}
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
        />

        {/* ✅ LOAD SDK */}
        <Script
          src="/morfinauth.js"
          strategy="beforeInteractive"
        />
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}